import Link from "next/link";
import { BRAND, TAGLINE } from "@/lib/brand";

export const metadata = { title: `Terms of service — ${BRAND}` };

const UPDATED = "13 September 2026";

export default function Terms() {
  return (
    <>
      <nav className="bar">
        <Link href="/" className="logo">{BRAND.toUpperCase()}<small>{TAGLINE}</small></Link>
        <div className="barlinks"><Link href="/">Home</Link><Link href="/design">Redesign a room</Link></div>
        <Link href="/design" className="btn">Get started</Link>
      </nav>

      <article className="legal">
        <h1 className="h">Terms of service</h1>
        <p className="updated">Last updated {UPDATED}</p>

        <p>By using {BRAND} you agree to what follows. If you do not agree, please do not use the site.</p>

        <h2 className="h">What {BRAND} does</h2>
        <p>You upload a photo of a room or outdoor space, choose a direction, and we generate an illustration of how it could look, along with design notes and suggested pieces. It is a visualisation tool for imagining changes, nothing more.</p>

        <h2 className="h">What it is not</h2>
        <p>The images are artistic impressions produced by an AI model. They are not architectural drawings, construction plans, or professional interior design advice. They may show pieces that do not exist, proportions that would not work in your actual space, or arrangements that ignore plumbing, wiring, load-bearing walls and building regulations.</p>
        <p>Please do not rely on a {BRAND} image when making a spending decision. Speak to a designer, architect or contractor before you commit money to a renovation.</p>

        <h2 className="h">Your photos</h2>
        <p>You must have the right to upload the photos you submit. Do not upload photos of other people&rsquo;s homes without permission, images you do not own, or pictures that contain people who have not agreed to it.</p>
        <p>You keep ownership of the photos you upload. You give us permission to process them for the purpose of producing your redesign, as described in our <Link href="/privacy">privacy policy</Link>.</p>

        <h2 className="h">The designs you get back</h2>
        <p>The redesigned images are yours to use, share and keep. Bear in mind that AI-generated images sit in an unsettled area of copyright law in many countries, and we make no promises about what rights you hold in them.</p>

        <h2 className="h">Fair use of the service</h2>
        <p>Free designs are limited per visitor per day so that the service stays available and affordable. Please do not try to work around those limits, use automated tools against the site, or upload anything illegal, hateful, sexual or designed to cause harm.</p>
        <p>We may decline service or remove content at our discretion.</p>

        <h2 className="h">Shopping links</h2>
        <p>Suggested pieces link to retailers such as Amazon, and those are affiliate links that may earn us a commission at no extra cost to you. We do not sell anything ourselves, we do not handle your payment, and we are not responsible for what you buy, what it costs, when it arrives or what condition it is in. Those are between you and the retailer.</p>

        <h2 className="h">Availability</h2>
        <p>{BRAND} is provided as is, without warranty. We cannot promise it will always be available, that every design will be to your taste, or that the service will keep running in its current form. We may change or discontinue it.</p>

        <h2 className="h">Liability</h2>
        <p>To the fullest extent the law allows, {BRAND} is not liable for any loss arising from your use of the site, including money spent on renovations, purchases or design work influenced by an image you generated here.</p>

        <h2 className="h">Changes</h2>
        <p>If these terms change, the date at the top will change with them. Continuing to use the site means you accept the updated version.</p>

        <h2 className="h">Contact</h2>
        <p>Email <a href="mailto:hello@example.com">hello@example.com</a>.</p>
      </article>

      <footer>{BRAND} · <Link href="/privacy">Privacy policy</Link> · As an Amazon Associate we earn from qualifying purchases.</footer>
    </>
  );
}
