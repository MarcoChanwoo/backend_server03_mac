import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from '../../../../../../../node_modules/joi/lib/index'; // ??

const { ObjectId } = mongoose.Types;

export const checkObjectId = (ctx, next) => {
    const { id } = ctx.params;
    if (!ObjectId.isValid(id)) {
        ctx.status = 400; // Bad Request
        return;
    }
    return next();
};

/*
    POST /api/posts
    {
        title: '제목',
        body: '내용'
        tags: ['태그1', '태그2']
    }
*/
export const write = async (ctx) => {
    const schema = Joi.object().keys({
        // joi 설정 시작
        title: Joi.string().required(),
        body: Joi.string().required(),
        tags: Joi.array().items(Joi.string()).required(),
    });

    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    } // joi 설정 끝

    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
    });
    try {
        await post.save();
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

/*
    GET /api/posts
*/
export const list = async (ctx) => {
    try {
        const posts = await Post.find().exec();
        ctx.body = posts;
    } catch (e) {
        ctx.throw(500, e);
    }
};

/*
    GET /api/posts/:id
*/
export const read = async (ctx) => {
    const { id } = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if (!post) {
            ctx.status = 404; // Not Found
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

/*
    DELETE /api/posts/:id
*/
export const remove = async (ctx) => {
    const { id } = ctx.params;
    try {
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204; // No Content-성공했으나 응답할 데이터가 없음
    } catch (e) {
        ctx.throw(500, e);
    }
};

/*
    PATCH /api/posts/:id
    {
        title: '수정',
        body: '수정할 내용',
        tags: ['수정', '태그']
    }
*/
export const update = async (ctx) => {
    const { id } = ctx.params;

    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });

    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true,
            // false: 업데이트되기 전의 데이터를 반환
        }).exec();
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};
