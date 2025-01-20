"use client";

import { UserAvatar } from "@/components/layout/user-avatar";
import { CropImageDialog } from "@/components/shared/settings/crop-image-dialog";
import { useUpload } from "@/hooks/use-upload";
import type { User } from "@proxed/supabase/types";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";

export function UserAvatarUpload({
	user,
	onSuccess,
	onError,
}: {
	user: User;
	onSuccess: (avatar_url: string) => void;
	onError: (message: string) => void;
}) {
	const [cropDialogOpen, setCropDialogOpen] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url);

	const { uploadFile, isLoading } = useUpload();

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => {
			setImage(acceptedFiles[0] ?? null);
			setCropDialogOpen(true);
		},
		accept: {
			"image/png": [".png"],
			"image/jpeg": [".jpg", ".jpeg"],
		},
		multiple: false,
	});

	const onCrop = async (croppedImageData: Blob | null) => {
		if (!croppedImageData) {
			return;
		}
		try {
			const filename = `${user.id}-${uuid()}.png`;
			const { url } = await uploadFile({
				path: ["u", user.id, filename],
				bucket: "avatars",
				file: new File([croppedImageData], filename, {
					type: "image/png",
				}),
			});

			if (!url) {
				throw new Error("Failed to upload image");
			}
			onSuccess(url);
			setAvatarUrl(url);
		} catch (e) {
			onError((e as Error).message);
		}
	};

	return (
		<>
			<div className="relative rounded-full" {...getRootProps()}>
				<input {...getInputProps()} />
				<UserAvatar
					className="size-24 cursor-pointer text-xl"
					avatarUrl={avatarUrl ?? ""}
					name={user.full_name ?? ""}
				/>

				{isLoading && (
					<div className="absolute inset-0 z-20 flex items-center justify-center bg-card/90">
						<LoaderIcon className="size-6 animate-spin text-primary" />
					</div>
				)}
			</div>

			<CropImageDialog
				image={image}
				open={cropDialogOpen}
				onOpenChange={setCropDialogOpen}
				onCrop={onCrop}
			/>
		</>
	);
}
