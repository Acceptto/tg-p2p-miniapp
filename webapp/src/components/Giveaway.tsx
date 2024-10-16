import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Gift, UserPlus, Share2, Clock, Plane, Hotel } from 'lucide-react';

const participants = [
	{ name: 'Olivia' },
	{ name: 'Emma' },
	{ name: 'Ava' },
	{ name: 'Sophia' },
	{ name: 'Isabella' },
	{ name: 'Mia' },
	{ name: 'Charlotte' },
	// Add more participants as needed
];

export default function Giveaway() {
	const [timeLeft, setTimeLeft] = useState(259200); // 3 days in seconds
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
		const seconds = time % 60;
		return `${days}d ${hours}h ${minutes}m ${seconds}s`;
	};

	const handleFollow = () => {
		setIsFollowing(!isFollowing);
	};

	const handleEnterGiveaway = () => {
		setIsEntered(true);
		setProgress(prev => Math.min(prev + 5, 100));
	};

	return (
		<Card className="w-full bg-stone-50 dark:bg-stone-900 shadow-md border-0 mx-auto max-w-sm sm:max-w-md">
			<CardHeader className="space-y-1 text-center pb-4">
				<div className="flex items-center justify-center mb-4">
					<Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-stone-200 dark:border-stone-700">
						<AvatarImage
							src="https://plus.unsplash.com/premium_photo-1682800179180-fb326934d458?q=80&w=3271&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
							alt="@minimalist_travels"
						/>
						<AvatarFallback>MT</AvatarFallback>
					</Avatar>
				</div>
				<CardTitle className="text-xl sm:text-2xl font-light text-stone-800 dark:text-stone-200">
					Our Hotel Giveaway ✈️
				</CardTitle>
				<CardDescription className="text-sm font-medium text-stone-600 dark:text-stone-400">
					@okzeeyou
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 sm:space-y-6">
				<div className="bg-white dark:bg-stone-800 p-3 sm:p-4 rounded-lg shadow-sm text-center">
					<p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">
						Giveaway Ends In:
					</p>
					<p className="text-lg sm:text-2xl font-light text-stone-800 dark:text-stone-200">
						{formatTime(timeLeft)}
					</p>
				</div>
				<div className="text-center">
					<p className="text-sm sm:text-lg font-light text-stone-600 dark:text-stone-400">
						Win a serene escape to our minimalist resort 🏝️
					</p>
				</div>
				<div className="space-y-3 sm:space-y-4">
					<h3 className="font-light text-lg sm:text-xl text-center text-stone-800 dark:text-stone-200">
						Prizes
					</h3>
					<div className="grid grid-cols-1 gap-2 sm:gap-3">
						<div className="p-2 sm:p-3 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center">
							<Hotel className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-stone-600 dark:text-stone-400" />
							<p className="text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200">
								3-Night Zen Retreat 🧘‍♀️
							</p>
						</div>
						<div className="p-2 sm:p-3 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center">
							<Plane className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-stone-600 dark:text-stone-400" />
							<p className="text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200">
								Eco-Friendly Travel Kit 🌿
							</p>
						</div>
						<div className="p-2 sm:p-3 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center">
							<Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-stone-600 dark:text-stone-400" />
							<p className="text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200">
								Mindful Experience Package 🕯️
							</p>
						</div>
					</div>
				</div>
				<Separator className="my-2 sm:my-4" />
				<div className="space-y-2 sm:space-y-3">
					<h4 className="font-light text-base sm:text-lg text-center text-stone-800 dark:text-stone-200">
						Fellow Travelers 👥
					</h4>
					<div className="flex justify-center -space-x-2">
						{participants.slice(0, 5).map((participant, index) => (
							<Avatar
								key={index}
								className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-stone-50 dark:border-stone-900"
							>
								<AvatarImage
									src={`https://i.pravatar.cc/150?img=${index + 1}`}
									alt={participant.name}
								/>
								<AvatarFallback>{participant.name[0]}</AvatarFallback>
							</Avatar>
						))}
						{participants.length > 5 && (
							<div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 text-xs font-medium border-2 border-stone-50 dark:border-stone-900">
								+{participants.length - 5}
							</div>
						)}
					</div>
					<Progress value={progress} className="w-full h-1" />
					<p className="text-xs sm:text-sm text-center text-stone-600 dark:text-stone-400">
						{progress}% of invitees have joined the journey
					</p>
				</div>
				<div className="space-y-2 sm:space-y-3">
					<Button
						onClick={handleFollow}
						variant={isFollowing ? 'secondary' : 'default'}
						className="w-full bg-stone-800 text-stone-100 hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-800 dark:hover:bg-stone-300 text-sm sm:text-base"
					>
						{isFollowing ? 'Following ✅' : 'Follow to Join 🤝'}
						<UserPlus className="w-4 h-4 ml-2" />
					</Button>
					<Button
						onClick={handleEnterGiveaway}
						className="w-full bg-stone-200 text-stone-800 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600 text-sm sm:text-base"
						disabled={isEntered || !isFollowing}
					>
						{isEntered ? 'Entered 🎉' : 'Enter Giveaway 🎁'}
						<Gift className="w-4 h-4 ml-2" />
					</Button>
				</div>
				{!isFollowing && (
					<p className="text-xs sm:text-sm text-center text-stone-500 dark:text-stone-400">
						Follow @okzeeyou to participate 👀
					</p>
				)}
				<Button variant="outline" className="w-full text-sm sm:text-base">
					Share with Travel Buddies 📢
					<Share2 className="w-4 h-4 ml-2" />
				</Button>
			</CardContent>
		</Card>
	);
}
