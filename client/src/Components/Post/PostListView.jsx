import { Link, useNavigate } from 'react-router-dom';
import { formatCount, formatDateRelative } from '@/Utils';
import { Button, PostCardView } from '@/Components';
import { icons } from '@/Assets/icons';
import parse from 'html-react-parser';
import { memo } from 'react';

const PostListView = memo(({ post, reference, children }) => {
    const {
        post_id,
        post_content,
        post_image,
        totalViews,
        post_title,
        post_createdAt,
        owner,
    } = post;
    const { user_id, user_name, user_avatar, user_fullName } = owner;

    const navigate = useNavigate();

    return (
        <div ref={reference}>
            {/* CARD VIEW */}
            <div className="sm:hidden">
                <PostCardView
                    post={post}
                    showOwnerInfo={true}
                    children={children}
                />
            </div>

            {/* LIST VIEW */}
            <div
                onClick={() => navigate(`/post/${post_id}`)} // items-start justify-start
                className="hidden relative cursor-pointer sm:flex flex-row w-full p-4 gap-x-4 bg-white drop-shadow-md rounded-2xl overflow-hidden"
            >
                {/* post image */}
                <div className="h-[250px] drop-shadow-md w-[50%] rounded-xl overflow-hidden">
                    <img
                        alt="post image"
                        src={post_image}
                        loading="lazy"
                        className="h-full object-cover w-full"
                    />
                </div>

                <div className="w-[50%] realtive flex flex-col items-start justify-start">
                    <div className="hover:cursor-text text-sm text-[#5a5a5a] w-full text-end">
                        {formatCount(totalViews)} views &bull;
                        {' ' + formatDateRelative(post_createdAt)}
                    </div>

                    <div className="mt-2 hover:cursor-text text-xl font-medium text-black text-ellipsis line-clamp-1">
                        {post_title}
                    </div>
                    <div className="hover:cursor-text text-sm text-gray-500 text-ellipsis line-clamp-2 mt-4">
                        {parse(post_content)}
                    </div>

                    {/* user info */}
                    <Link
                        to={`/channel/${user_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-start justify-start gap-3 mt-7"
                    >
                        {/* avatar */}
                        <div className="drop-shadow-md">
                            <div className="size-[50px]">
                                <img
                                    alt="post owner avatar"
                                    src={user_avatar}
                                    className="size-full object-cover rounded-full hover:brightness-90"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="text-ellipsis line-clamp-1 text-[18px] hover:text-[#5c5c5c] font-medium text-black w-fit">
                                {user_fullName}
                            </div>

                            <div className="text-black hover:text-[#5c5c5c] text-[16px] w-fit">
                                @{user_name}
                            </div>
                        </div>
                    </Link>

                    <div className="absolute right-6 bottom-6 text-white">
                        <Button
                            btnText={
                                <div className="flex items-center justify-center gap-3">
                                    <span>Read more</span>
                                    <div className="size-[16px] fill-white">
                                        {icons.rightArrow}
                                    </div>
                                </div>
                            }
                            defaultStyles={true}
                            onClick={() => navigate(`/post/${post_id}`)}
                            className="py-[5px] px-3 text-white"
                        />
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
});

export default PostListView;
