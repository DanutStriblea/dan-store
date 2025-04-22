const Spinner = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
