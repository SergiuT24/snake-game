import './App.css'
import Board from './components/Board'

const App: React.FC = () => {
	const gridSize = 20;

	return (

		<>
			<h1 className='mb-10 text-center'>Snake Game</h1>
			<Board gridSize={gridSize} />
		</>
	)
}

export default App;
