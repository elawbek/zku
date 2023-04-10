#!/bin/bash

cd circuits
rm -rf Sudoku 
mkdir Sudoku

if [ -f ./powersOfTau28_hez_final_17.ptau ]; then
    echo "powersOfTau28_hez_final_17.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_17.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_17.ptau
fi

echo "Compiling Sudoku.circom..."

# compile circuit

circom Sudoku.circom --r1cs --wasm --sym -o Sudoku
snarkjs r1cs info Sudoku/Sudoku.r1cs

# Start a new zkey and make a contribution
snarkjs plonk setup Sudoku/Sudoku.r1cs powersOfTau28_hez_final_17.ptau Sudoku/circuit_final.zkey 
snarkjs zkey export verificationkey Sudoku/circuit_final.zkey Sudoku/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Sudoku/circuit_final.zkey ../contracts/SudokuPlonkVerifier.sol

cd ..

npx ts-node scripts/ts/plonk.ts Sudoku

