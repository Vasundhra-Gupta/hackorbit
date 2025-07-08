import { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/Components';
import { userService, followerService, requestService } from '@/Services';
import {
    useChannelContext,
    useUserContext,
    usePopupContext,
    useSocketContext,
} from '@/Context';
import toast from 'react-hot-toast';
import { icons } from '@/Assets/icons';

export default function ChannelPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { channel, setChannel } = useChannelContext();
    const { user } = useUserContext();
    const [loading, setLoading] = useState(true);
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const [request, setRequest] = useState(null);
    const [chat, setChat] = useState(null);
    const { socket } = useSocketContext();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function getChannelProfile() {
            try {
                setLoading(true);
                const [res, request] = await Promise.all([
                    userService.getChannelProfile(signal, userId),
                    user ? requestService.getRequest(userId, signal) : null,
                ]);

                if (res && !res.message) {
                    setChannel(res);
                    if (request && !request.message) {
                        if (request.isRequest) setRequest(request);
                        else setChat(request);
                    }
                } else setChannel(null);
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [userId, user]);

    async function toggleFollow() {
        try {
            if (!user) {
                setShowPopup(true);
                setPopupInfo({ type: 'login', content: 'Follow' });
                return;
            }
            const res = await followerService.toggleFollow(userId);
            if (res && res.message === 'follow toggled successfully') {
                setChannel((prev) => ({
                    ...prev,
                    isFollowed: !prev.isFollowed,
                }));
            }
        } catch (err) {
            navigate('/server-error');
        }
    }

    async function handleCollab() {
        try {
            if (!user) {
                setShowPopup(true);
                setPopupInfo({ type: 'login', content: 'Collab' });
                return;
            }
            if (request) {
                if (request.sender_id === user.user_id) {
                    toast.error('Collab Request Already Sent');
                    return;
                } else {
                    const res = await requestService.acceptRequest(
                        request.request_id
                    );
                    if (res && !res.message) {
                        toast.success(
                            'Collab Request Accepted Successfully 🤝'
                        );
                        socket.emit('requestAccepted', res);
                        setChat(res);
                        setRequest(null);
                    }
                }
            } else if (chat) {
                navigate(`/chat/${chat.chat_id}`);
            } else {
                const res = await requestService.sendRequest(userId);
                if (res && !res.message) {
                    socket.emit('newRequest', res);
                    setRequest(res);
                    toast.success('Request Sent Successfully 🤝');
                }
            }
        } catch (err) {
            navigate('/server-error');
        }
    }

    const tabs = [
        { name: 'posts', path: '' },
        { name: 'About', path: 'about' },
        { name: 'Projects', path: 'projects' },
        ...(user?.user_id == channel?.user_id
            ? [
                  { name: 'Saved', path: 'saved-posts' },
                  { name: 'Liked', path: 'liked-posts' },
              ]
            : []),
    ];

    const tabElements = tabs?.map(({ name, path }) => (
        <NavLink
            key={name}
            to={path}
            end
            className={({ isActive }) =>
                `${isActive ? 'border-b-[#4977ec] bg-[#4977ec] text-white' : 'border-b-gray-300 bg-[#f9f9f9] text-black'} shadow-sm hover:backdrop-brightness-90 rounded-t-md p-2 border-b-3 w-full text-center font-medium`
            }
        >
            <div className="w-full text-center">{name}</div>
        </NavLink>
    ));

    return loading ? (
        <div>loading...</div>
    ) : channel ? (
        <div className="w-full h-full">
            {/* owner coverImage */}
            <div className="w-full h-[180px] overflow-hidden rounded-xl shadow-md">
                {channel.user_coverImage ? (
                    <img
                        src={channel.user_coverImage}
                        alt="channel coverImage"
                        className="object-cover h-full w-full"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="flex items-center justify-center size-10 text-gray-400">
                            {icons.image}
                        </div>
                    </div>
                )}
            </div>

            {/* owner info */}
            <div className="flex items-center justify-between w-full pr-0 sm:pr-8 relative">
                <div className="flex items-center justify-start gap-4">
                    {/* owner avatar */}
                    <div className="relative -top-8 flex gap-4 items-center justify-start">
                        <div className="relative">
                            <div className="rounded-full overflow-hidden size-[140px] shadow-sm">
                                <img
                                    alt="user avatar"
                                    src={channel.user_avatar}
                                    className="size-full object-cover"
                                />
                            </div>
                        </div>

                        {/* channel info*/}
                        <div className="flex flex-col items-start justify-center mt-6">
                            <div className="text-2xl font-medium">
                                {channel.user_fullName}
                            </div>
                            <div className="text-lg mt-1 text-[#151515]">
                                @{channel.user_name}
                            </div>
                            <div className="flex gap-1 mt-1 items-center justify-start text-[#3f3f3f] text-[16px]">
                                {channel.totalFollowers} followers &bull;
                                {' ' + channel.totalViews} views
                            </div>
                        </div>
                    </div>
                </div>

                {/* follow/edit btn */}
                {user?.user_name === channel.user_name ? (
                    <div className="">
                        <Button
                            btnText="Edit"
                            onClick={() => navigate('/settings')}
                            className="py-[5px] px-4 text-white"
                            defaultStyles={true}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col pb-10 sm:flex-row gap-2 sm:gap-4">
                        <Button
                            btnText={channel.isFollowed ? 'UnFollow' : 'Follow'}
                            onClick={toggleFollow}
                            className="py-[5px] px-4 text-white"
                            defaultStyles={true}
                        />
                        <Button
                            btnText={
                                user
                                    ? chat
                                        ? 'Chat'
                                        : request?.sender_id === user.user_id
                                          ? 'Request Sent'
                                          : request?.receiver_id ===
                                              user.user_id
                                            ? 'Accept'
                                            : 'Connect'
                                    : 'Connect'
                            }
                            onClick={handleCollab}
                            defaultStyles={true}
                            className="py-[5px] px-4 sm:px-6 text-white"
                        />
                    </div>
                )}
            </div>

            {/* tabs */}
            <div className="flex gap-2 justify-evenly w-full px-2">
                {tabElements}
            </div>

            <div className="w-full mt-6">
                <Outlet />
            </div>
        </div>
    ) : (
        <div>Channel Not Found !!</div>
    );
}
