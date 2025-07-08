import { useState } from 'react';
import { verifyExpression } from '@/Utils';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/Services';
import { Button } from '@/Components';
import toast from 'react-hot-toast';
import { useUserContext } from '@/Context';

export default function UpdatePassword() {
    const initialInputs = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const navigate = useNavigate();
    const { user } = useUserContext();

    async function handleChange(e) {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    async function handleBlur(e) {
        const { name, value } = e.target;
        if (value && name === 'newPassword') {
            verifyExpression(name, value, setError);
        }
    }

    async function onMouseOver() {
        if (Object.values(inputs).some((value) => !value)) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setDisabled(true);
        setError({});
        try {
            if (inputs.newPassword !== inputs.confirmPassword) {
                setError((prevError) => ({
                    ...prevError,
                    confirmPassword:
                        'confirm password should match new password',
                }));
            } else if (inputs.oldPassword === inputs.newPassword) {
                setError((prevError) => ({
                    ...prevError,
                    newPassword: 'new password should not match old password',
                }));
            } else {
                const res = await userService.updatePassword(
                    inputs.newPassword,
                    inputs.oldPassword
                );
                if (res && res.message === 'password updated successfully') {
                    setInputs(initialInputs);
                    toast.success('Password updated successfully');
                } else {
                    setError((prev) => ({ ...prev, oldPassword: res.message }));
                }
            }
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
        }
    }

    const inputFields = [
        {
            name: 'oldPassword',
            type: 'password',
            placeholder: 'Enter current Password',
            label: 'Old Password',
            required: true,
        },
        {
            name: 'newPassword',
            type: 'password',
            placeholder: 'Create new password',
            label: 'New Password',
            required: true,
        },
        {
            name: 'confirmPassword',
            type: 'password',
            placeholder: 'Confirm new password',
            label: 'Confirm Password',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) => (
        <div key={field.name}>
            <div className="bg-[#f9f9f9] z-[1] ml-3 px-2 w-fit relative top-3 font-medium">
                <label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                </label>
            </div>
            <div>
                <input
                    type={field.type}
                    name={field.name}
                    id={field.name}
                    value={inputs[field.name]}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={field.required}
                    className="shadow-md shadow-[#f7f7f7] py-[15px] rounded-[5px] pl-[10px] w-full border-[0.01rem] border-gray-500 bg-transparent"
                />
            </div>
            {field.name === 'newPassword' && (
                <div className="text-sm">Password must be 8-12 characters.</div>
            )}
            {error[field.name] && (
                <div className="pt-[0.09rem] text-red-500 text-sm">
                    {error[field.name]}
                </div>
            )}
        </div>
    ));

    return (
        <div className="w-full pt-2">
            <div className="rounded-xl shadow-sm m-1 flex flex-col sm:flex-row bg-[#f9f9f9] sm:gap-12 px-4 lg:px-8 pb-4">
                <div className="w-full py-6">
                    <h3 className="text-2xl font-semibold">Change Password</h3>
                    <p className="mt-4">
                        {user.auth_provider === 'local'
                            ? 'Update your password to secure your account. Changes are final once saved.'
                            : 'Password change is not available for Google accounts.'}
                    </p>
                </div>
                {user.auth_provider === 'local' && (
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-[600px]"
                    >
                        <div className="flex flex-col gap-4">
                            {inputElements}
                        </div>
                        <div className="flex gap-6 mt-6">
                            <Button
                                btnText="Cancel"
                                onMouseOver={onMouseOver}
                                disabled={loading}
                                onClick={() => {
                                    setInputs(initialInputs);
                                    setError({});
                                }}
                                defaultStyles={true}
                                className="w-full bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-black px-3 py-1"
                            />
                            <Button
                                btnText={loading ? 'Updating...' : 'Update'}
                                type="submit"
                                disabled={disabled}
                                onMouseOver={onMouseOver}
                                defaultStyles={true}
                                className="text-white py-2 w-full"
                            />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
