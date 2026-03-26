import { FC, ReactElement } from "react";

interface PageTransitionProps {
	children: ReactElement;
}

/**
 * Wrapper component that applies smooth fade-in animation to any page
 */
const PageTransition: FC<PageTransitionProps> = ({ children }) => {
	return (
		<div className="page-transition">
			{children}
		</div>
	);
};

export default PageTransition;
