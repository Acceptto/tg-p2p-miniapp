import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const ConfettiEffect: React.FC = () => {
	useEffect(() => {
		var end = Date.now() + 2 * 1000;

		var colors = ['#bb0000', '#ffffff'];

		(function frame() {
			confetti({
				particleCount: 2,
				angle: 60,
				spread: 70,
				origin: { x: 0 },
				colors: colors,
			});
			confetti({
				particleCount: 2,
				angle: 120,
				spread: 70,
				origin: { x: 1 },
				colors: colors,
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		})();
	}, []);

	return null;
};
