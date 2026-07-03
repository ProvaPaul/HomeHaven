import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../lib/axios';
import { contactSellerSchema } from '../../lib/validations';
import { selectUser } from '../../features/auth/authSlice';
import { cn } from '../../lib/utils';

export default function ContactSellerForm({ propertyId, propertyTitle }) {
  const user = useSelector(selectUser);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSellerSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      message: `Hi, I'm interested in "${propertyTitle}". Please contact me with more details.`,
    },
  });

  const onSubmit = async (data) => {
    try {
      await api.post(`/properties/${propertyId}/contact`, data);
      toast.success('Message sent to the seller!');
      reset({ ...data, message: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label="Name" name="name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" name="email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <Input label="Phone (optional)" name="phone" type="tel" placeholder="+1 (555) 000-0000" error={errors.phone?.message} {...register('phone')} />
      <div>
        <label htmlFor="seller-message" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Message
        </label>
        <textarea
          id="seller-message"
          rows={4}
          className={cn('input-field resize-none', errors.message && 'input-error')}
          {...register('message')}
        />
        {errors.message && (
          <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{errors.message.message}</p>
        )}
      </div>
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        <Send className="h-4 w-4" />
        Contact Seller
      </Button>
    </form>
  );
}
