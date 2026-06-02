interface MetaProps {
  name: string;
  value: any;
}
export const Meta = (props: MetaProps) => {
  return (
    <>
      <div className="meta">{props.name}:</div>
      <div className="meta-info">{props.value}</div>
    </>
  );
};
