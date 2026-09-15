import Link from "next/link";
import { BRAND, TAGLINE } from "@/lib/brand";

export const metadata = { title: `Privacy policy — ${BRAND}` };

const UPDATED = "13 September 2026";

export default function Privacy() {
  return (
    <>
      <nav className="bar">
        <Link href="/" className="logo">{BRAND.toUpperCase()}<small>{TAGLINE}</small></Link>
        <div className="barlinks"><Link href="/">Home</Link><Link href="/design">Redesign a room</Link></div>
        <Link href="/design" className="btn">Get started</Link>
      </nav>

      <article className="legal">
        <h1 className="h">Privacy policy</h1>
        <p className="updated">Last updated {UPDATED}</p>

        <p>{BRAND} lets you upload a photo of a room and see it redesigned. This page explains what we do with that photo and anything else we collect. We have tried to keep it in plain English.</p>

        <h2 className="h">What we collect</h2>
        <p><strong>Photos you upload.</strong> The room photos you give us, plus any extra angles.</p>
        <p><strong>What you tell us about the room.</strong> The room type, style and vibe you pick, what you write in the description box, and any changes you ask for afterwards.</p>
        <p><strong>Basic technical information.</strong> Your IP address and browser details, which arrive automatically with any web request. We use your IP address to apply the daily limit on free designs.</p>
        <p>We do not ask for your name, email address or payment details, and there are no accounts.</p>

        <h2 className="h">What we do with it</h2>
        <p>Your photo and description are sent to two AI services so they can produce your redesign: OpenAI generates the image, and Anthropic writes the design notes and the list of pieces in your room. They process the photo to answer that single request.</p>
        <p>Neither company uses this material to train their models. That is their standard policy for the business interfaces we use.</p>
        <p>We do not sell your photos or your information, and we do not share them with anyone beyond the services described here.</p>

        <h2 className="h">Where photos are stored, and for how long</h2>
        <p>Uploaded photos and finished redesigns are stored with our hosting provider, Vercel, so that they can be shown to you and handed to the AI services. Each file gets a long, random web address that nobody can guess and that is not listed anywhere. Anyone you send that address to will be able to open the image, which is what makes a redesign shareable.</p>
        <p>Photos are deleted automatically after 30 days. If you would like something removed sooner, write to us and we will take care of it.</p>

        <h2 className="h">Shopping links</h2>
        <p>Designs come with links to retailers such as Amazon. These are affiliate links, which means we may earn a commission if you buy something, at no extra cost to you. Following one of those links takes you to that retailer&rsquo;s own site, where their privacy policy applies, not ours.</p>

        <h2 className="h">Cookies</h2>
        <p>We do not use advertising or tracking cookies. Our host may set essential cookies needed to serve the site.</p>

        <h2 className="h">Children</h2>
        <p>{BRAND} is not intended for children under 13, and we do not knowingly collect information from them.</p>

        <h2 className="h">Your choices</h2>
        <p>Because we do not hold accounts, the simplest control is what you choose to upload. Avoid including people, documents or anything else private in the frame. You can ask us to delete a photo at any time using the address below.</p>
        <p>Depending on where you live, you may have rights to access or delete information we hold about you. Write to us and we will do our best to help.</p>

        <h2 className="h">Changes</h2>
        <p>If this policy changes, the date at the top will change with it.</p>

        <h2 className="h">Contact</h2>
        <p>Questions, or want a photo removed? Email <a href="mailto:hello@example.com">hello@example.com</a>.</p>
      </article>

      <footer>{BRAND} · <Link href="/terms">Terms of service</Link> · As an Amazon Associate we earn from qualifying purchases.</footer>
    </>
  );
}
