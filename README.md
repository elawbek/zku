## This is my journey through the interesting study of circom and snarkJS

I took the assignments from here: https://zku.gnomio.com/course/view.php?id=8

### Useful links:

1. [Circom2 documentation](https://docs.circom.io/getting-started/installation/)
2. [circomlib](https://github.com/iden3/circomlib/tree/master/circuits) and [circomlib-matrix](https://github.com/socathie/circomlib-matrix/tree/master/circuits)
3. [Building circuits and proofs and verify them using the snarkJS CLI](https://www.samsclass.info/141/proj/C523.htm)
4. [Introduction to Zero Knowledge Proof](https://github.com/enricobottazzi/ZKverse/blob/master/README.md)
5. [A beginners intro to coding zero knowledge proofs](https://dev.to/spalladino/a-beginners-intro-to-coding-zero-knowledge-proofs-c56)
6. [ZK Learning Group](https://learn.0xparc.org/)

---

All circuits are located in the `circuits/helper` folder:

1. `Multiplier2.circom` gets two numbers and proves the result of
   their multiplication
2. `Multiplier3.circom` gets three numbers and proves the result of their multiplication
3. `LessThan10.circom` gets a number and proves it's less than 10
4. `RangeProof.circom` gets the number and two elements as a range (i.e. [lower bound, upper bound]) and proves that the number is less than or equal to the upper bound and greater than or equal to the lower bound

to run all compilations and tests:

```bash
  sh scripts/run.sh
```

to clear the results of all compilations:

```bash
  sh scripts/clean.sh
```

you can also run each test separately:

```bash
  sh scripts/compile-{circuit-name}.sh
  npx hardhat test test/{circuit-name}.test.ts
```

all of these circuits have a small number of constraints, so we need `powersOfTau28_hez_final_10`, where 10 is the power of two - for less than 1024 (2\*\*10) constraints

---

`Sudoku.circom` receives a sudoku puzzle and its solution and proves the solution

**Note**: an incorrect solution does not create proof

this circuit have a 114002 constraints, so we need `powersOfTau28_hez_final_17` or 2\*\*17

you can run test (about 2 minutes):

```bash
  sh scripts/compile-Sudoku.sh
  npx hardhat test test/sudoku.test.ts
```

---
