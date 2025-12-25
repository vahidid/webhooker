import { AxiosError } from "axios";
import { toast } from "sonner";

export interface ErrorScheme {
	meta: { success: boolean; error_code: string; error_target: []; help: "" };
	message: string;
	error: {
		code: string;
		message: string;
		errors: null;
	};
}

export class AppError extends Error {
	errorScheme?: ErrorScheme;
	constructor(msg: string, errorScheme?: ErrorScheme) {
		super(msg);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, AppError.prototype);
		this.errorScheme = errorScheme;

		// this.logError();
	}

	logError() {
		console.error(
			"Service Error >>> ",
			this.message,
			JSON.stringify(this.errorScheme),
		);
	}
}
export function ServerHandleError(error: unknown) {
	console.error("ServerHandleError: ", error);
	if (error instanceof Error) {
		// Log the error

		console.error("ServerHandleError", error);
	}

	if (error instanceof AxiosError) {
		if (error.response?.status === 401) {
			throw new AppError("Unauthorized");
		}
		// Handle Axios Error
		throw new AppError(error.response?.data?.message || "Server Error");
	}

	throw new AppError("Server Error");
}
export function ClientHandleError(error: unknown) {
	console.error("Client Error >> ", error);
	// Handle Axios Error
	if (error instanceof AxiosError) {
		if (error.response?.data instanceof Blob) {
			// In case of handle blob response errors
			error.response?.data.text().then((errText) => {
				const errData = JSON.parse(errText) as ErrorScheme;
				toast.error(errData.error?.message, {
					position: "top-center",
				});
			});
			return;
		}
		toast.error(error.response?.data?.error, {
			position: "top-center",
		});
		return;
	}

	if (error instanceof AppError) {
		toast.error(error.message, {
			position: "top-center",
		});
		return;
	}

	toast.error("Server Error", {
		position: "top-center",
	});
}

export function QueryClientHandleError(data: unknown) {
	if (data && typeof data === "object" && "success" in data) {
		if (!data.success && "error" in data) {
			throw new AppError(data.error as string);
		}
	}
	console.debug("Debug error: ", data);

	throw new AppError("Server Error");
}
