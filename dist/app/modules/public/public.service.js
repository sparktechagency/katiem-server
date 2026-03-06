"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const public_model_1 = require("./public.model");
const user_model_1 = require("../user/user.model");
const emailHelper_1 = require("../../../helpers/emailHelper");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const createPublic = async (payload) => {
    const isExist = await public_model_1.Public.findOne({
        type: payload.type,
    });
    if (isExist) {
        await public_model_1.Public.findByIdAndUpdate(isExist._id, {
            $set: {
                content: payload.content,
            },
        }, {
            new: true,
        });
    }
    else {
        const result = await public_model_1.Public.create(payload);
        if (!result)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Public');
    }
    return `${payload.type} created successfully`;
};
const getAllPublics = async (type) => {
    const result = await public_model_1.Public.findOne({ type: type }).lean();
    return result || [];
};
const deletePublic = async (id) => {
    const result = await public_model_1.Public.findByIdAndDelete(id);
    return result;
};
const createContact = async (payload) => {
    try {
        // Find admin user to send notification
        const admin = await user_model_1.User.findOne({ role: 'admin' });
        if (!admin || !admin.email) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Admin user not found');
        }
        // Create contact form entry
        const result = await public_model_1.Contact.create(payload);
        if (!result)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Contact');
        // Send email notification to admin
        const emailData = {
            to: admin.email,
            subject: 'New Contact Form Submission',
            html: `
        <h1>New Contact Form Submission</h1>
        <p>You have received a new message from the contact form:</p>
        <ul>
          <li><strong>Name:</strong> ${payload.name}</li>
          <li><strong>Email:</strong> ${payload.email}</li>
          <li><strong>Phone:</strong> ${payload.phone}</li>
          <li><strong>Country:</strong> ${payload.country}</li>
        </ul>
        <h2>Message:</h2>
        <p>${payload.message}</p>
        <p>You can respond directly to the sender by replying to: ${payload.email}</p>
      `,
        };
        emailHelper_1.emailHelper.sendEmail(emailData);
        // Send confirmation email to the user
        const userEmailData = {
            to: payload.email,
            subject: 'Thank you for contacting us',
            html: `
        <h1>Thank You for Contacting Us</h1>
        <p>Dear ${payload.name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <p><em>${payload.message}</em></p>
        <p>Best regards,<br>The Instant Labour Team</p>
      `,
        };
        emailHelper_1.emailHelper.sendEmail(userEmailData);
        return {
            message: 'Contact form submitted successfully',
        };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to submit contact form');
    }
};
const getAllContacts = async (filters, paginationOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const andConditions = [];
    if (Object.keys(filters).length) {
        andConditions.push({
            $and: Object.entries(filters).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        public_model_1.Contact.find(whereConditions)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit),
        public_model_1.Contact.countDocuments(whereConditions),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
const ReplyContact = async (id, payload) => {
    const result = await public_model_1.Contact.findByIdAndUpdate(id, { $set: { feedback: payload.feedback, isSolved: true } }, {
        new: true,
    });
    if (!result)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to send feedback, please try again.');
    //send the mail to the user updating the issue resolution status
    const emailData = {
        to: result.email,
        subject: 'Your issue has been resolved',
        html: `
      <h1>Your issue has been resolved</h1>
      <p>Dear ${result.name},</p>
      <p>We have resolved your issue and would like to inform you that it has been successfully resolved.</p>
      <p>Feedback: ${result.feedback}</p>
      <p>If you have any further questions or concerns, please do not hesitate to reach out to us.</p>
      <p>Best regards,<br>The Instant Labour Team</p>
    `,
    };
    emailHelper_1.emailHelper.sendEmail(emailData);
    return result;
};
const deleteContact = async (id) => {
    const result = await public_model_1.Contact.findByIdAndDelete(id);
    return 'Contact deleted successfully';
};
const createFaq = async (payload) => {
    const result = await public_model_1.Faq.create(payload);
    if (!result)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Faq');
    return result;
};
const getAllFaqs = async () => {
    const result = await public_model_1.Faq.find({});
    return result || [];
};
const getSingleFaq = async (id) => {
    const result = await public_model_1.Faq.findById(id);
    return result || null;
};
const updateFaq = async (id, payload) => {
    const result = await public_model_1.Faq.findByIdAndUpdate(id, { $set: payload }, {
        new: true,
    });
    return result;
};
const deleteFaq = async (id) => {
    const result = await public_model_1.Faq.findByIdAndDelete(id);
    return result;
};
exports.PublicServices = {
    createPublic,
    getAllPublics,
    deletePublic,
    createContact,
    createFaq,
    getAllFaqs,
    getSingleFaq,
    updateFaq,
    deleteFaq,
    getAllContacts,
    ReplyContact,
    deleteContact,
};
