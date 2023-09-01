import Joi from '../../../../../../../node_modules/joi/lib/index';
import User from '../../models/user';

/*
    POST /api/auth/register
    {
        username: 'marco',
        password: 'pass12'
    }
*/
export const register = async (ctx) => {
    // 회원가입
    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(3).max(20).required(),
        password: Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { username, password } = ctx.request.body;
    try {
        const exists = await User.findByUsername(username);
        if (exists) {
            ctx.status = 409; // Conflict
            return;
        }

        const user = new User({
            username,
        });
        await user.setPassword(password);
        await user.save();

        const data = user.toJSON();
        delete data.hashedPassword;
        ctx.body = user.serialize();
        // ctx.body = data;
    } catch (e) {
        ctx.throw(500, e);
    }
};

export const login = async (ctx) => {
    // 로그인
    const { username, password } = ctx.request.body;

    if (!username || !password) {
        ctx.status = 401;
        return;
    }

    try {
        const user = await User.findByUsername(username);
        if (!user) {
            ctx.status = 401;
            return;
        }
        const valid = await user.checkPassword(password);
        if (!valid) {
            ctx.status = 401;
            return;
        }
        ctx.body = user.serialize();
    } catch (e) {
        ctx.throw(500, e);
    }
};

export const check = async (ctx) => {
    // 로그인 상태 확인
};

export const logout = async (ctx) => {
    // 로그아웃
};
