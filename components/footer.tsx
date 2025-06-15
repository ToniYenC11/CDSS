import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Republic of the Philippines</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All content is in the public domain unless otherwise stated.
            </p>
            <div className="space-y-2">
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                About GOVPH
              </Link>
              <p className="text-sm text-muted-foreground">
                Learn more about the Philippine government, its structure, how government works and the people behind
                it.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <div className="space-y-2">
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                GOV.PH
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                Open Data Portal
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                Official Gazette
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Government Links</h4>
            <div className="space-y-2">
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                Office of the President
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                Office of the Vice President
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                Senate of the Philippines
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                House of Representatives
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                Supreme Court
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                Court of Appeals
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-primary">
                Sandiganbayan
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Clinical Decision Support System - DOST-ASTI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
