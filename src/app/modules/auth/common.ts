import { StatusCodes } from 'http-status-codes'
import { ILoginData } from '../../../interfaces/auth'
import ApiError from '../../../errors/ApiError'
import { USER_STATUS } from '../../../enum/user'
import { User } from '../user/user.model'
import { AuthHelper } from './auth.helper'
import { generateOtp } from '../../../utils/crypto'
import { IAuthResponse } from './auth.interface'
import { IUser } from '../user/user.interface'
import { emailTemplate } from '../../../shared/emailTemplate'
import { emailHelper } from '../../../helpers/emailHelper'
import config from '../../../config'


const handleLoginLogic = async (
  payload: ILoginData,
  isUserExist: IUser
): Promise<IAuthResponse> => {
  const { authentication, verified, status, password } = isUserExist;
  const { restrictionLeftAt, wrongLoginAttempts } = authentication;

  // 1️⃣ If user is deleted
  if (status === USER_STATUS.DELETED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "No account found with this email, please create an account."
    );
  }

  // 2️⃣ If user account is restricted (too many wrong attempts)
  if (status === USER_STATUS.RESTRICTED) {
    if (restrictionLeftAt && new Date() < restrictionLeftAt) {
      const remainingMinutes = Math.ceil(
        (restrictionLeftAt.getTime() - Date.now()) / 60000
      );

      throw new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        `You are restricted to login for ${remainingMinutes} minutes`
      );
    }

    // Restriction expired → reset
    await User.findByIdAndUpdate(isUserExist._id, {
      $set: {
        authentication: { restrictionLeftAt: null, wrongLoginAttempts: 0 },
        status: USER_STATUS.ACTIVE,
      },
    });
  }

  // 3️⃣ If user is NOT VERIFIED → send OTP
  if (!verified) {
    const otp = generateOtp();
    const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000);

    await User.findByIdAndUpdate(isUserExist._id, {
      $set: {
        authentication: {
          email: payload.email,
          oneTimeCode: otp,
          expiresAt: otpExpiresIn,
          latestRequestAt: new Date(),
          authType: "createAccount",
        },
      },
    });

    const otpTemplate = emailTemplate.createAccount({
      name: isUserExist.name!,
      email: isUserExist.email!,
      otp,
    });

    emailHelper.sendEmail(otpTemplate);
    const message = config.node_env === "development" ? `${otp} is the OTP for ${payload.email}` : "An OTP has been sent to your email. Please verify."
    return authResponse(
      StatusCodes.OK,
      message,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    );
  }

  // 4️⃣ Check password
  const isPasswordMatched = await User.isPasswordMatched(
    payload.password,
    password
  );

  if (!isPasswordMatched) {
    const updatedAttempts = wrongLoginAttempts + 1;

    // Lock user if >= 5 failed attempts
    if (updatedAttempts >= 5) {
      await User.findByIdAndUpdate(isUserExist._id, {
        $set: {
          status: USER_STATUS.RESTRICTED,
          authentication: {
            wrongLoginAttempts: updatedAttempts,
            restrictionLeftAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        },
      });
    } else {
      // Just increment attempts
      await User.findByIdAndUpdate(isUserExist._id, {
        $set: {
          authentication: {
            wrongLoginAttempts: updatedAttempts,
            restrictionLeftAt: null,
          },
        },
      });
    }

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Incorrect password, please try again."
    );
  }

  // 5️⃣ Password correct → reset counters
  await User.findByIdAndUpdate(isUserExist._id, {
    $set: {
      deviceToken: payload.deviceToken,
      authentication: {
        wrongLoginAttempts: 0,
        restrictionLeftAt: null,
      },
    },
  });

  // 6️⃣ Issue tokens
  const tokens = AuthHelper.createToken(
    isUserExist._id,
    isUserExist.role,
    isUserExist.name,
    isUserExist.email
  );

  return authResponse(
    StatusCodes.OK,
    `Welcome back ${isUserExist.name}`,
    isUserExist.role,
    tokens.accessToken,
    tokens.refreshToken
  );
};


export const AuthCommonServices = {
  handleLoginLogic,
}



export const authResponse = (status: number, message: string,role?: string, accessToken?: string, refreshToken?: string, token?: string, isVerified?: boolean): IAuthResponse => {
  return {
    status,
    message,
    ...(role && { role }),
    ...(accessToken && { accessToken }),
    ...(refreshToken && { refreshToken }),
    ...(token && { token }),
    ...(!isVerified && { isVerified }),
  }
}