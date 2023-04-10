pragma circom 2.1.5;

include "../node_modules/circomlib-matrix/circuits/matElemSum.circom";
include "../node_modules/circomlib-matrix/circuits/matElemPow.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "./helpers/RangeProof.circom";

template Sudoku() {  
    signal input puzzle[9][9];
    signal input solution[9][9];
    signal output out;

    component rangeProofs[9][9];
    // square the full solution
    component square = matElemPow(9,9,2);

    for(var i = 0; i < 9; i++) {
      for(var j = 0; j < 9; j++) {
        rangeProofs[i][j] = RangeProof(32);
        rangeProofs[i][j].in <== solution[i][j];
        rangeProofs[i][j].range[0] <== 1;
        rangeProofs[i][j].range[1] <== 9;
        1 === rangeProofs[i][j].out;

        0 === puzzle[i][j] * (solution[i][j] - puzzle[i][j]);

        square.a[i][j] <== solution[i][j];
      }
    }

    // check all rows, columns and blocks sum of solution to 45 and sum of sqaures is 285
    component row[9];
    component col[9];
    component block[9];
    component rowSq[9];
    component colSq[9];
    component blockSq[9];

    for (var k = 0; k < 9; k++) {
        row[k] = matElemSum(1, 9);
        col[k] = matElemSum(1, 9);
        block[k] = matElemSum(3, 3);

        rowSq[k] = matElemSum(1, 9);
        colSq[k] = matElemSum(1, 9);
        blockSq[k] = matElemSum(3, 3);

        for (var i = 0; i < 9; i++) {
            row[k].a[0][i] <== solution[k][i];
            col[k].a[0][i] <== solution[i][k];

            rowSq[k].a[0][i] <== square.out[k][i];
            colSq[k].a[0][i] <== square.out[i][k];
        }
        var x = 3 * (k % 3);
        var y = 3 * (k \ 3);
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                block[k].a[i][j] <== solution[x + i][y + j];
                blockSq[k].a[i][j] <== square.out[x + i][y + j];
            }
        }
        row[k].out === 45;
        col[k].out === 45;
        block[k].out === 45;

        rowSq[k].out === 285;
        colSq[k].out === 285;
        blockSq[k].out === 285;
    }
    
    // hash the original puzzle and emit so that you can listen for puzzle solved events
    component poseidon[9];
    component hash = Poseidon(9);

    for (var i = 0; i < 9; i++) {
        poseidon[i] = Poseidon(9);
        for (var j = 0; j < 9; j++) {
            poseidon[i].inputs[j] <== puzzle[i][j];
        }
        hash.inputs[i] <== poseidon[i].out;
    }

    out <== hash.out;
}

component main {public [puzzle]} = Sudoku();