import ErrorPage from "./ErrorPage";

const UnauthorizedPage = () => {
  return <ErrorPage status={401} />;
};

export default UnauthorizedPage;
