import {
	createContext,
	useEffect,
	useReducer,
	FC,
	ReactNode,
	Dispatch,
} from "react";

export interface UserRole {
	authority: string;
}

export interface User {
	id?: number;
	username?: string;
	email?: string;
	password?: string;
	roles?: (UserRole | string)[];
	profilePicture?: string | null;
}

export interface Post {
	id?: number;
	title?: string;
	content?: string;
	author?: string;
	imageUrl?: string;
	authorId?: number;
	authorUsername?: string;
	collectionId?: number;
	collectionName?: string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	comments?: any[];
}

export interface LoginState {
	user: User | null;
	isFetching: boolean;
	error: boolean;
	jwt: string | null;
}

export interface LoginContextType extends LoginState {
	dispatch: Dispatch<LoginAction>;
}

export type LoginAction =
	| { type: "LOGIN_START" }
	| { type: "LOGIN_SUCCESS"; payload: { user: User; jwt: string } }
	| { type: "LOGIN_FAILURE" }
	| { type: "LOGOUT" }
	| { type: "UPDATE_USER"; payload: User };

export const isAdmin = (user: User | null): boolean => {
	if (!user?.roles) return false;
	return user.roles.some((role) => {
		if (typeof role === "string") {
			return role === "ROLE_ADMIN" || role === "ADMIN";
		}
		return role.authority === "ROLE_ADMIN" || role.authority === "ADMIN";
	});
};

export const isWriter = (user: User | null): boolean => {
	if (!user?.roles) return false;
	return user.roles.some((role) => {
		// Handle both string and object formats
		if (typeof role === "string") {
			return role === "ROLE_WRITER" || role === "WRITER";
		}
		return role.authority === "ROLE_WRITER" || role.authority === "WRITER";
	});
};

const INITIAL_STATE: LoginState = {
	user: JSON.parse(localStorage.getItem("user") || "null"),
	isFetching: false,
	error: false,
	jwt: JSON.parse(localStorage.getItem("jwt") || "null"),
};

const LoginReducer = (state: LoginState, action: LoginAction): LoginState => {
	switch (action.type) {
		case "LOGIN_START":
			return {
				user: null,
				isFetching: true,
				error: false,
				jwt: null,
			};

		case "LOGIN_SUCCESS":
			return {
				user: action.payload.user,
				isFetching: false,
				error: false,
				jwt: action.payload.jwt,
			};

		case "LOGIN_FAILURE":
			return {
				user: null,
				isFetching: false,
				error: true,
				jwt: null,
			};
		case "LOGOUT":
			return {
				user: null,
				isFetching: false,
				error: false,
				jwt: null,
			};

		case "UPDATE_USER":
			return {
				...state,
				user: action.payload,
			};

		default:
			return state;
	}
};

export const LoginContext = createContext<LoginContextType>({
	user: null,
	isFetching: false,
	error: false,
	jwt: null,
	dispatch: () => {},
});

interface LoginContextProviderProps {
	children: ReactNode;
}

export const LoginContextProvider: FC<LoginContextProviderProps> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(LoginReducer, INITIAL_STATE);

	useEffect(() => {
		localStorage.setItem("user", JSON.stringify(state.user));
		localStorage.setItem("jwt", JSON.stringify(state.jwt));
	}, [state.user, state.jwt]);

	return (
		<LoginContext.Provider
			value={{
				user: state.user,
				isFetching: state.isFetching,
				error: state.error,
				jwt: state.jwt,
				dispatch,
			}}
		>
			{children}
		</LoginContext.Provider>
	);
};
