import { ErrorCode } from '@/common/enums';
import { HttpStatus } from '@nestjs/common';

export const exceptionCase = {
  [ErrorCode.EMAIL_ALREADY_REGISTERED]: {
    status: HttpStatus.CONFLICT,
    message: 'Email is already registered!',
    errorCode: ErrorCode.EMAIL_ALREADY_REGISTERED,
  },
  [ErrorCode.EMAIL_NO_AUTHENTICATED]: {
    status: HttpStatus.CONFLICT,
    message: 'Email has not been authenticated!',
    errorCode: ErrorCode.EMAIL_NO_AUTHENTICATED,
  },
  [ErrorCode.INCORRECT_PASSWORD]: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Incorrect password!',
    errorCode: ErrorCode.INCORRECT_PASSWORD,
  },
  [ErrorCode.USER_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Email is not registered!',
    errorCode: ErrorCode.USER_NOT_FOUND,
  },
  [ErrorCode.OTP_INVALID]: {
    status: HttpStatus.BAD_REQUEST,
    message: 'OTP is expired or invalid!',
    errorCode: ErrorCode.OTP_INVALID,
  },
  [ErrorCode.MISSING_INPUT]: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Missing input!',
    errorCode: ErrorCode.MISSING_INPUT,
  },
  [ErrorCode.INVALID_LINK_EMAIL_VERIFICATION]: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid confirmation link!',
    errorCode: ErrorCode.INVALID_LINK_EMAIL_VERIFICATION,
  },
  [ErrorCode.EMAIL_DEACTIVATED]: {
    status: HttpStatus.FORBIDDEN,
    message: 'Email has been deactivated!',
    errorCode: ErrorCode.EMAIL_NO_AUTHENTICATED,
  },
  [ErrorCode.INVITATION_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: 'Invitation is not found',
    errorCode: ErrorCode.INVITATION_NOT_FOUND,
  },
  [ErrorCode.CATEGORY_ALREADY_EXIST]: {
    status: HttpStatus.CONFLICT,
    message: 'Category already exists',
    errorCode: ErrorCode.CATEGORY_ALREADY_EXIST,
  },
  [ErrorCode.CATEGORY_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Category is not found',
    errorCode: ErrorCode.CATEGORY_NOT_FOUND,
  },
};
