sh scripts/clean.sh

sh scripts/compile-Multiplier2.sh
sh scripts/compile-Multiplier3-groth16.sh
sh scripts/compile-Multiplier3-plonk.sh
sh scripts/compile-LessThan10.sh
sh scripts/compile-RangeProof.sh
sh scripts/compile-Sudoku.sh

npx hardhat test