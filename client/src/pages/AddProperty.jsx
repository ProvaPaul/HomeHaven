import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import PropertyForm from '../components/property/PropertyForm';
import { createProperty } from '../features/properties/propertyThunks';

export default function AddProperty() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    const result = await dispatch(createProperty(payload));
    if (createProperty.fulfilled.match(result)) {
      toast.success('Property listed successfully!');
      navigate(`/properties/${result.payload._id}`);
    } else {
      toast.error(result.payload || 'Could not create the listing');
    }
  };

  return (
    <div className="container-page max-w-4xl py-10 lg:py-14">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">List a Property</h1>
      <p className="mt-1.5 text-gray-600 dark:text-gray-400">
        Fill in the details below to publish your listing.
      </p>
      <div className="mt-8">
        <PropertyForm onSubmit={handleSubmit} submitLabel="Publish Listing" />
      </div>
    </div>
  );
}
