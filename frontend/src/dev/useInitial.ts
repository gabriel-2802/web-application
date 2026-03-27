import { useState } from "react";

interface Status {
	loading: boolean;
	error: boolean;
}

export const useInitial = (): Status => {
	const [status] = useState<Status>({
		loading: false,
		error: false,
	});
	return status;
};
