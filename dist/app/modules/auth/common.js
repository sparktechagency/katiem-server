"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResponse = exports.AuthCommonServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_1 = require("../../../enum/user");
const user_model_1 = require("../user/user.model");
const auth_helper_1 = require("./auth.helper");
const crypto_1 = require("../../../utils/crypto");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const config_1 = __importDefault(require("../../../config"));
const handleLoginLogic = async (payload, isUserExist) => {
    const { authentication, verified, status, password } = isUserExist;
    const { restrictionLeftAt, wrongLoginAttempts } = authentication;
    // 1️⃣ If user is deleted
    if (status === user_1.USER_STATUS.DELETED) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No account found with this email, please create an account.");
    }
    // 2️⃣ If user account is restricted (too many wrong attempts)
    if (status === user_1.USER_STATUS.RESTRICTED) {
        if (restrictionLeftAt && new Date() < restrictionLeftAt) {
            const remainingMinutes = Math.ceil((restrictionLeftAt.getTime() - Date.now()) / 60000);
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS, `You are restricted to login for ${remainingMinutes} minutes`);
        }
        // Restriction expired → reset
        await user_model_1.User.findByIdAndUpdate(isUserExist._id, {
            $set: {
                authentication: { restrictionLeftAt: null, wrongLoginAttempts: 0 },
                status: user_1.USER_STATUS.ACTIVE,
            },
        });
    }
    // 3️⃣ If user is NOT VERIFIED → send OTP
    if (!verified) {
        const otp = (0, crypto_1.generateOtp)();
        const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000);
        await user_model_1.User.findByIdAndUpdate(isUserExist._id, {
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
        const otpTemplate = emailTemplate_1.emailTemplate.createAccount({
            name: isUserExist.name,
            email: isUserExist.email,
            otp,
        });
        emailHelper_1.emailHelper.sendEmail(otpTemplate);
        const message = config_1.default.node_env === "development" ? `${otp} is the OTP for ${payload.email}` : "An OTP has been sent to your email. Please verify.";
        return (0, exports.authResponse)(http_status_codes_1.StatusCodes.OK, message, undefined, undefined, undefined, undefined, false);
    }
    // 4️⃣ Check password
    const isPasswordMatched = await user_model_1.User.isPasswordMatched(payload.password, password);
    if (!isPasswordMatched) {
        const updatedAttempts = wrongLoginAttempts + 1;
        // Lock user if >= 5 failed attempts
        if (updatedAttempts >= 5) {
            await user_model_1.User.findByIdAndUpdate(isUserExist._id, {
                $set: {
                    status: user_1.USER_STATUS.RESTRICTED,
                    authentication: {
                        wrongLoginAttempts: updatedAttempts,
                        restrictionLeftAt: new Date(Date.now() + 10 * 60 * 1000),
                    },
                },
            });
        }
        else {
            // Just increment attempts
            await user_model_1.User.findByIdAndUpdate(isUserExist._id, {
                $set: {
                    authentication: {
                        wrongLoginAttempts: updatedAttempts,
                        restrictionLeftAt: null,
                    },
                },
            });
        }
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Incorrect password, please try again.");
    }
    // 5️⃣ Password correct → reset counters
    await user_model_1.User.findByIdAndUpdate(isUserExist._id, {
        $set: {
            deviceToken: payload.deviceToken,
            authentication: {
                wrongLoginAttempts: 0,
                restrictionLeftAt: null,
            },
        },
    });
    // 6️⃣ Issue tokens
    const tokens = auth_helper_1.AuthHelper.createToken(isUserExist._id, isUserExist.role, isUserExist.name, isUserExist.email);
    return (0, exports.authResponse)(http_status_codes_1.StatusCodes.OK, `Welcome back ${isUserExist.name}`, isUserExist.role, tokens.accessToken, tokens.refreshToken);
};
exports.AuthCommonServices = {
    handleLoginLogic,
};
const authResponse = (status, message, role, accessToken, refreshToken, token, isVerified) => {
    return {
        status,
        message,
        ...(role && { role }),
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(token && { token }),
        ...(!isVerified && { isVerified }),
    };
};
exports.authResponse = authResponse;
