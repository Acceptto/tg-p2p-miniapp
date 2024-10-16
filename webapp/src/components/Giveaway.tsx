import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Share2, Clock, Plane, Hotel } from 'lucide-react';

const participants = [
	{ name: 'Olivia' },
	{ name: 'Emma' },
	{ name: 'Ava' },
	{ name: 'Sophia' },
	{ name: 'Isabella' },
];

export default function Giveaway() {
	const [timeLeft, setTimeLeft] = useState(259200);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isEntered, setIsEntered] = useState(false);
	const [progress, setProgress] = useState(65);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (time: number) => {
		const days = Math.floor(time / 86400);
		const hours = Math.floor((time % 86400) / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		return `${days}d ${hours}h ${minutes}m`;
	};

	const handleFollow = () => setIsFollowing(!isFollowing);
	const handleEnterGiveaway = () => {
		setIsEntered(true);
		setProgress(prev => Math.min(prev + 5, 100));
	};

	return (
		<Card className="w-full max-h-[100vh] overflow-hidden bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 mx-auto max-w-sm">
			<CardHeader className="p-3 text-center">
				<div className="flex items-center justify-center mb-2">
					<Avatar className="w-12 h-12 border-2 border-blue-200 dark:border-blue-700">
						<AvatarImage
							src="https://source.unsplash.com/random/100x100?travel"
							alt="@minimalist_travels"
						/>
						<AvatarFallback>MT</AvatarFallback>
					</Avatar>
				</div>
				<CardTitle className="text-lg font-light text-gray-800 dark:text-gray-100">
					Hotel Giveaway ✈️
				</CardTitle>
				<CardDescription className="text-xs font-medium text-blue-600 dark:text-blue-400">
					@okzeeyou
				</CardDescription>
			</CardHeader>
			<CardContent className="p-3 space-y-3">
				<div className="bg-blue-50 dark:bg-blue-900 p-2 rounded-lg text-center">
					<p className="text-xs font-medium text-blue-700 dark:text-blue-300">
						Ends in: <span className="text-sm font-bold">{formatTime(timeLeft)}</span>
					</p>
				</div>
				<p className="text-xs text-center text-gray-600 dark:text-gray-300">
					Win a serene escape to our minimalist resort 🏝️
				</p>
				<div className="grid grid-cols-3 gap-2 text-xs">
					<div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
						<Hotel className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
						<p className="font-medium text-gray-800 dark:text-gray-200 text-center">3-Night Stay</p>
					</div>
					<div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
						<Plane className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
						<p className="font-medium text-gray-800 dark:text-gray-200 text-center">Travel Kit</p>
					</div>
					<div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
						<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
						<p className="font-medium text-gray-800 dark:text-gray-200 text-center">Experiences</p>
					</div>
				</div>
				<Separator className="my-2 bg-gray-200 dark:bg-gray-700" />
				<div className="space-y-2">
					<div className="flex justify-center -space-x-1">
						{participants.map((participant, index) => (
							<Avatar key={index} className="w-6 h-6 border-2 border-white dark:border-gray-900">
								<AvatarImage
									src={`https://i.pravatar.cc/150?img=${index + 1}`}
									alt={participant.name}
								/>
								<AvatarFallback>{participant.name[0]}</AvatarFallback>
							</Avatar>
						))}
					</div>
					<Progress value={progress} className="w-full h-1 bg-blue-100 dark:bg-blue-900" />
					<p className="text-xs text-center text-gray-600 dark:text-gray-400">{progress}% joined</p>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Button
						onClick={handleFollow}
						variant={isFollowing ? 'secondary' : 'default'}
						className="w-full py-1 px-2 text-xs bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-gray-900 dark:hover:bg-blue-400"
					>
						{isFollowing ? 'Following ✅' : 'Follow 🤝'}
					</Button>
					<Button
						onClick={handleEnterGiveaway}
						className="w-full py-1 px-2 text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						disabled={isEntered || !isFollowing}
					>
						{isEntered ? 'Entered 🎉' : 'Enter 🎁'}
					</Button>
				</div>
				{!isFollowing && (
					<p className="text-xs text-center text-gray-500 dark:text-gray-400">
						Follow to participate 👀
					</p>
				)}
				<Button
					variant="outline"
					className="w-full py-1 px-2 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
				>
					Share 📢
					<Share2 className="w-3 h-3 ml-1" />
				</Button>
			</CardContent>
		</Card>
	);
}
