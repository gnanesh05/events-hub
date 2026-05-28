interface Props {
  title: string;
  subtitle: string;
  align?: 'center' | 'left';
}

const PageHeader = ({ title, subtitle, align = 'center' }: Props) => {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col ${alignClass}`}>
      <h1>{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
    </div>
  );
};

export default PageHeader;
