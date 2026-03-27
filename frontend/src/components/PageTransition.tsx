import { FC, ReactElement } from "react";

interface PageTransitionProps {
	children: ReactElement;
}

const PageTransition: FC<PageTransitionProps> = ({ children }) => {
	return (
		<div className="page-transition">
			{children}
		</div>
	);
};

export default PageTransition;
