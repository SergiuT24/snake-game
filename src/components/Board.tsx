import React, { useState, useEffect, useRef } from 'react';
import appleIcon from '../assets/apple.svg';
import eatSound from '../assets/pop.mp3';

interface BoardProps {
	gridSize: number;
}

const Board: React.FC<BoardProps> = ({ gridSize }) => {
	const [snake, setSnake] = useState<{ x: number; y: number }[]>([
		{ x: 9, y: 9 },
		{ x: 8, y: 9 },
	]);

	const [speed, setSpeed] = useState(200);

	const [apple, setApple] = useState<{ x: number; y: number }>({
		x: Math.floor(Math.random() * gridSize),
		y: Math.floor(Math.random() * gridSize),
	});

	const appleSound = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		appleSound.current = new Audio(eatSound);
		appleSound.current.volume = 0.5;
	}, []);

	const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('right');

	const [gameOver, setGameOver] = useState(false);

	const [canChangeDirection, setCanChangeDirection] = useState(true);

	const [score, setScore] = useState(0);

	const [highScore, setHighScore] = useState(() => {
		return Number(localStorage.getItem('highScore')) || 0;
	});

	const initialSnakeValue = [
		{ x: 9, y: 9 },
		{ x: 8, y: 9 },
	];

	const moveSnake = () => {
		setSnake((prevSnake) => {
			const newHead = { ...prevSnake[0] };

			if (direction === 'up') newHead.y -= 1;
			if (direction === 'down') newHead.y += 1;
			if (direction === 'left') newHead.x -= 1;
			if (direction === 'right') newHead.x += 1;

			// With wall
			// const hitWall = newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize;

			// Via wall
			if (newHead.x < 0) newHead.x = gridSize - 1;
			if (newHead.x >= gridSize) newHead.x = 0;
			if (newHead.y < 0) newHead.y = gridSize - 1;
			if (newHead.y >= gridSize) newHead.y = 0;

			const hitSelf = prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y);

			if (hitSelf) {
				setGameOver(true);
				return prevSnake;
			}

			const ateApple = newHead.x === apple.x && newHead.y === apple.y;

			if (ateApple) {
				const newSnake = [newHead, ...prevSnake];
				setScore((prevScore) => prevScore + 10);

				if (appleSound.current) {
					appleSound.current.play();
				}
				generateApple(newSnake);

				return newSnake;
			} else {
				return [newHead, ...prevSnake.slice(0, -1)];
			}
		});
		setCanChangeDirection(true);
	};

	const generateApple = (currentSnake: { x: number; y: number }[]) => {
		let newApple: any;
		let isOnSnake;

		do {
			newApple = {
				x: Math.floor(Math.random() * gridSize),
				y: Math.floor(Math.random() * gridSize),
			};
			isOnSnake = currentSnake.some(segment => segment.x === newApple.x && segment.y === newApple.y);

		} while (isOnSnake);

		setApple(newApple);
	};

	const restartGame = () => {
		setSnake(initialSnakeValue);
		generateApple(initialSnakeValue);
		setScore(0);
		setGameOver(false);
		setDirection('right');
	}

	useEffect(() => {
		if (gameOver) return;

		let intervalSpeed;

		if (score < 500) {
			intervalSpeed = speed;
		} else if (score < 1000) {
			intervalSpeed = 150;
		} else if (score < 1500) {
			intervalSpeed = 100;
		} else {
			intervalSpeed = 50;
		}

		const interval = setInterval(moveSnake, intervalSpeed);
		return () => clearInterval(interval);
	}, [direction, gameOver, score]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!canChangeDirection) return;

			if (event.key === 'ArrowUp' && direction !== 'down') {
				setDirection('up');
				setCanChangeDirection(false);
			}
			if (event.key === 'ArrowDown' && direction !== 'up') {
				setDirection('down');
				setCanChangeDirection(false);
			}
			if (event.key === 'ArrowLeft' && direction !== 'right') {
				setDirection('left');
				setCanChangeDirection(false);
			}
			if (event.key === 'ArrowRight' && direction !== 'left') {
				setDirection('right');
				setCanChangeDirection(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [direction, canChangeDirection]);

	useEffect(() => {
		if (score > highScore) {
			setHighScore(score);
			localStorage.setItem('highScore', score.toString());
		}
	}, [score, highScore]);

	const grid: React.ReactNode[] = [];

	for (let y = 0; y < gridSize; y++) {
		for (let x = 0; x < gridSize; x++) {
			const isSnake = snake.some(segment => segment.x === x && segment.y === y);
			const isApple = apple.x === x && apple.y === y;

			grid.push(
				<div
					key={`${x}-${y}`}
					className={`cell w-6 h-6 inline-block box-border relative ${isSnake ? 'bg-green-500 border' : isApple ? 'bg-white' : 'bg-white'}`}
				>
					{isApple && (
						<img src={appleIcon} alt='Apple' className='absolute inset-0 w-full h-full' />
					)}
				</div>
			);
		}
	}


	return (
		<div className='flex gap-32'>
			<div>
				<div className='text-xl text-green-500'>Score: {score}</div>
				<button
					onClick={restartGame}
					className='my-2'
				>
					Restart Game
				</button>
				<div className="text-lg text-center text-gray-500 mb-4">High Score: {highScore}</div>
			</div>
			{gameOver && (<div className='text-red-500 text-2xl font-bold mb-4'>Game Over!</div>)}
			<div className='border-2 border-black' style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
				{grid}
			</div>
		</div>
	);

};

export default Board;