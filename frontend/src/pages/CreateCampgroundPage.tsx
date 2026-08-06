import { createCampground } from "@/api/campground.api";
import { Button } from "@/components/ui/button";
import {
  createCampgroundSchema,
  type CreateCampgroundFormData,
} from "@/schemas/campground.schema";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const CreateCampgroundPage = () => {
  const currentUser = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampgroundFormData>({
    resolver: zodResolver(createCampgroundSchema),
  });

  const navigate = useNavigate();

  const handleCreateCampground: SubmitHandler<
    CreateCampgroundFormData
  > = async (data) => {
    console.log(data);
  };

  if (!currentUser) {
    navigate("/login");
  }

  return (
    <form onSubmit={handleSubmit(handleCreateCampground)}>
      <div>
        <label htmlFor="title" className="flex">
          Title
        </label>
        <input className="border b-2" id="title" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="description" className="flex">
          Description
        </label>
        <textarea
          className="border b-2"
          placeholder="Description"
          id="description"
          {...register("description")}
        />
        {errors.description && <p>{errors.description.message}</p>}
      </div>
      <div>
        <label htmlFor="street" className="flex">
          Street
        </label>
        <input
          className="border b-2"
          placeholder="Street"
          id="street"
          {...register("street")}
        />
        {errors.street && <p>{errors.street.message}</p>}
      </div>
      <div>
        <label htmlFor="houseNumber" className="flex">
          House Number
        </label>
        <input
          className="border b-2"
          type="text"
          placeholder="House Number"
          id="houseNumber"
          {...register("houseNumber")}
        />
        {errors.houseNumber && <p>{errors.houseNumber.message}</p>}
      </div>
      <div>
        <label htmlFor="city" className="flex">
          City
        </label>
        <input
          className="border b-2"
          type="text"
          placeholder="City"
          id="city"
          {...register("city")}
        />
        {errors.city && <p>{errors.city.message}</p>}
      </div>
      <div>
        <label htmlFor="images" className="flex">
          Images
        </label>
        <input
          className="border b-2"
          type="file"
          multiple
          accept="image/*"
          placeholder="Images"
          id="images"
          {...register("images")}
        />
        {errors.images && <p>{errors.images.message}</p>}
      </div>
      <div>
        <label htmlFor="price" className="flex">
          Price
        </label>
        <input
          className="border b-2"
          type="number"
          placeholder="Price"
          id="price"
          step={0.01}
          {...register("price", {
            valueAsNumber: true,
          })}
        />
        {errors.price && <p>{errors.price.message}</p>}
      </div>

      <Button
        disabled={isSubmitting}
        className="block border b-2 w-full mt-5 p-2"
        type="submit"
      >
        {isSubmitting ? "Creating..." : "Create"}
      </Button>
    </form>
  );
};

export default CreateCampgroundPage;
