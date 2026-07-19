try {
  const error = new Error();
  throw error;
} catch (error) {
  console.log(typeof error.stack);
  console.log(typeof error);
}
