import { MailingListForm } from './mailing-list-form';

type Props = {
  heading: string;
  subheading: string;
};

export function MailingListBand({ heading, subheading }: Props) {
  return (
    <section className="bg-obsidian py-20 lg:py-28 px-6">
      <MailingListForm heading={heading} subheading={subheading} />
    </section>
  );
}
