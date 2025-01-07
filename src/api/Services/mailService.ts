import {base_request} from "../request.ts";
import {api} from "../api.ts";
import {VerificationLoginRequest} from "../Model/Request/MailRequest/VerificationLoginRequest.ts";
import {MailBindRequest} from "../Model/Request/MailRequest/MailBindRequest.ts";

export class MailService{
    /**
     * 获取邮箱验证码
     * @param mail
     */
    public static sendMailCodeUsingGet(
        mail: string
    ) {
        return base_request(
            "get",
            api.EMAIL_GET_CODE,
            {
                mail: mail,
            },
        );
    }

    /**
     * 邮箱登录
     * @param verificationLoginRequest
     */
    public static userLoginByMailUsingPost(
        verificationLoginRequest: VerificationLoginRequest
    ) {
        return base_request(
            "post",
            api.EMAIL_LOGIN,
            verificationLoginRequest,
        );
    }

    /**
     * 绑定邮箱
     * @param mailBindRequest
     */
    public static bindMailUsingPost(
        mailBindRequest: MailBindRequest
    ) {
        return base_request(
            "post",
            api.EMAIL_BIND,
            mailBindRequest,
        );
    }
}
