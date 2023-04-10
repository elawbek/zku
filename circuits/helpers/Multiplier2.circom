pragma circom 2.1.5;

/*This circuit template checks that c is the multiplication of a and b.*/  
template Multiplier2 () {  
   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output out;  

   // Constraints.  
   out <== a * b;  
}