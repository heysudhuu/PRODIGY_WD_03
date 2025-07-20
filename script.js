const cells = document.querySelectorAll('.cell');
const statusDiv = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreDraw = document.getElementById('scoreDraw');
const playerXNameSpan = document.getElementById('playerXName');
const playerONameSpan = document.getElementById('playerOName');
const themeToggle = document.getElementById('theme-toggle');
const winLineSVG = document.getElementById('win-line');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let scores = { X: 0, O: 0, Draw: 0 };
let playerNames = { X: "X", O: "O" };

// Sound effects
const beep = () => { new AudioContext().createOscillator().frequency.setValueAtTime(440, 0); };
function playSound(type) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    if (type === "move") o.frequency.value = 440;
    if (type === "win") o.frequency.value = 660;
    if (type === "draw") o.frequency.value = 330;
    g.gain.value = 0.1;
    o.start();
    o.stop(ctx.currentTime + 0.15);
}

// Winning line coordinates for SVG
const winLineCoords = [
    [ [10,40], [250,40] ],   // row 1
    [ [10,130], [250,130] ], // row 2
    [ [10,220], [250,220] ], // row 3
    [ [40,10], [40,250] ],   // col 1
    [ [130,10], [130,250] ], // col 2
    [ [220,10], [220,250] ], // col 3
    [ [20,20], [240,240] ],  // diag \
    [ [240,20], [20,240] ]   // diag /
];

const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diags
];

function promptNames() {
    let x = prompt("Enter Player X name:", "Player X");
    let o = prompt("Enter Player O name:", "Player O");
    if (x) playerNames.X = x;
    if (o) playerNames.O = o;
    playerXNameSpan.textContent = playerNames.X;
    playerONameSpan.textContent = playerNames.O;
}

function checkWinner() {
    for (let i = 0; i < winPatterns.length; i++) {
        const [a, b, c] = winPatterns[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], pattern: i };
        }
    }
    return board.includes("") ? null : { winner: "Draw" };
}

function drawWinLine(patternIdx) {
    winLineSVG.innerHTML = "";
    if (patternIdx == null) return;
    const [start, end] = winLineCoords[patternIdx];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", start[0]);
    line.setAttribute("y1", start[1]);
    line.setAttribute("x2", start[0]);
    line.setAttribute("y2", start[1]);
    line.setAttribute("stroke", "#ff0");
    line.setAttribute("stroke-width", "8");
    line.setAttribute("stroke-linecap", "round");
    winLineSVG.appendChild(line);

    // Animate the line
    setTimeout(() => {
        line.setAttribute("x2", end[0]);
        line.setAttribute("y2", end[1]);
    }, 50);
}

function handleClick(e) {
    const idx = e.target.dataset.index;
    if (!gameActive || board[idx]) return;
    board[idx] = currentPlayer;
    e.target.textContent = currentPlayer;

    // Add pop animation
    e.target.classList.remove('pop');
    void e.target.offsetWidth; // trigger reflow
    e.target.classList.add('pop');

    playSound("move");
    const result = checkWinner();
    if (result) {
        gameActive = false;
        if (result.winner === "Draw") {
            statusDiv.textContent = "It's a Draw!";
            scores.Draw++;
            scoreDraw.textContent = scores.Draw;
            playSound("draw");
            // Shake all cells
            cells.forEach(cell => {
                cell.classList.add('shake');
                setTimeout(() => cell.classList.remove('shake'), 400);
            });
            setTimeout(resetGame, 1500);
        } else {
            statusDiv.textContent = `${playerNames[result.winner]} Wins!`;
            scores[result.winner]++;
            if (result.winner === "X") scoreX.textContent = scores.X;
            if (result.winner === "O") scoreO.textContent = scores.O;
            drawWinLine(result.pattern);
            playSound("win");
            // Highlight winning cells
            const winCells = winPatterns[result.pattern];
            winCells.forEach(i => cells[i].classList.add('win'));
        }
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDiv.textContent = `Player ${playerNames[currentPlayer]}'s turn`;
    }
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('win', 'pop', 'shake');
    });
    statusDiv.textContent = `Player ${playerNames[currentPlayer]}'s turn`;
    winLineSVG.innerHTML = "";
}

function toggleTheme() {
    document.body.classList.toggle("light");
    themeToggle.textContent = document.body.classList.contains("light") ? "Switch Dark" : "Switch Light";
}

// Responsive SVG size
function resizeSVG() {
    const boardRect = document.getElementById('game-board').getBoundingClientRect();
    winLineSVG.setAttribute("width", boardRect.width);
    winLineSVG.setAttribute("height", boardRect.height);
}

window.addEventListener('resize', resizeSVG);

cells.forEach(cell => cell.addEventListener('click', handleClick));
resetBtn.addEventListener('click', resetGame);
themeToggle.addEventListener('click', toggleTheme);

promptNames();
resizeSVG();
statusDiv.textContent = `Player ${playerNames[currentPlayer]}'s turn`;
scoreX.textContent = scores.X;
scoreO.textContent = scores.O;
scoreDraw.textContent = scores.Draw;

