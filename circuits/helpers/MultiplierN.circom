pragma circom 2.1.5;

include "./Multiplier2.circom";

/**
  e.g:
  in = [a, b, c, d, e, f, g]

  comp[0].a = a
  comp[0].b = b
  comp[0].out = a*b

  for(var i = 0; i < 5 /* 7-2 *\; i++) 
    comp[0 + 1].a = a*b
    comp[0 + 1].b = c /* in[0 + 2] *\
    comp[0 + 1].out = a*b*c 

    comp[1 + 1].a = a*b*c
    comp[1 + 1].b = d /* in[1 + 2] *\
    comp[1 + 1].out = a*b*c*d 

    comp[2 + 1].a = a*b*c*d
    comp[2 + 1].b = e /* in[2 + 2] *\
    comp[2 + 1].out = a*b*c*d*e

    comp[3 + 1].a = a*b*c*d*e
    comp[3 + 1].b = f /* in[3 + 2] *\
    comp[3 + 1].out = a*b*c*d*e*f

    comp[4 + 1].a = a*b*c*d
    comp[4 + 1].b = g /* in[3 + 2] *\
    comp[4 + 1].out = a*b*c*d*e*g

  out <== comp[5].out /* a*b*c*d*e*g *\
*/

template MultiplierN (N){
   //Declaration of signals.
   signal input in[N];
   signal output out;
   component comp[N - 1];

   //Statements.
   for(var i = 0; i < N - 1; i++){
       comp[i] = Multiplier2();
   }

   comp[0].a <== in[0];
   comp[0].b <== in[1];

   for(var i = 0; i < N - 2; i++){
       comp[i + 1].a <== comp[i].out;
       comp[i + 1].b <== in[i + 2];
   }

   out <== comp[N - 2].out; 
}

