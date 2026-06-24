import { MailingListForm } from './mailing-list-form';

type Props = {
  heading: string;
  subheading: string;
};

export function MailingListBand({ heading, subheading }: Props) {
  return (
    <section className="bg-obsidian py-20 lg:py-28 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <MailingListForm heading={heading} subheading={subheading} />
      </div>
    </section>
  );
}
