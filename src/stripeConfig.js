import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RE7AxQ5icmbyzr4bCKEnQZTIzaSpRzGt0ObP7es4BbKnTmMPQZyMWN9F4M9eMkB5w4pzhqJMfFCliIRPgzNUVY200TIoVGkay"
);

export default stripePromise;
