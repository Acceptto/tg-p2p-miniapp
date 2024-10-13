import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const ConfettiEffect: React.FC = () => {
	useEffect(() => {
		const scalar = 2;
		const unicorn = confetti.shapeFromText({ text: '🦄', scalar });

		const defaults: confetti.Options = {
			spread: 360,
			ticks: 60,
			gravity: 0,
			decay: 0.96,
			startVelocity: 20,
			shapes: [unicorn],
			scalar,
		};

		function shoot() {
			confetti({
				...defaults,
				particleCount: 30,
			});

			confetti({
				...defaults,
				particleCount: 5,
			});

			confetti({
				...defaults,
				particleCount: 15,
				scalar: scalar / 2,
				shapes: ['circle'],
			});
		}

		// Launch three bursts of confetti
		setTimeout(shoot, 0);
		setTimeout(shoot, 100);
		setTimeout(shoot, 200);

		// Clean up function (optional, as the confetti will finish on its own)
		return () => {
			confetti.reset();
		};
	}, []);

	return null;
};
