import PageLink from "./PageLink"
import Icon from "./Icon"

type PaginationProps = {
  currentPage: number
  lastPage: number
  maxPageLinks?: number
  boundaryCount?: number
  setCurrentPage: (page: number) => void
}

/**
 * Generates an array of pagination items including page numbers and `NaN` for ellipsis.
 *
 * The returned array may contain:
 * - page numbers to display
 * - `NaN` representing a "..." (ellipsis)
 *
 * @param currentPage - The currently selected page (1-based)
 * @param lastPage - The last available page number
 * @param maxPageLinks - Maximum number of visible pagination items
 * @param boundaryCount - Number of fixed pages to show at the start and end (default: 1)
 * @returns An array of page numbers and `NaN` representing ellipsis
 */
const getPaginationItems = (
  currentPage: number,
  lastPage: number,
  maxPageLinks: number,
  boundaryCount = 1,
): (number | typeof NaN)[] => {
  // If the total number of pages is less than or equal to maxPageLinks, return all pages
  if (lastPage <= maxPageLinks) {
    return Array.from({ length: lastPage }, (_, i) => i + 1)
  }

  const pages: (number | typeof NaN)[] = []

  // Number of slots available for the middle pages (excluding boundaries)
  const middleSlots = maxPageLinks - boundaryCount * 2

  // Calculate the start and end of the middle range, centered around currentPage
  let startMiddle = Math.max(
    boundaryCount + 1,
    currentPage - Math.floor((middleSlots - 2) / 2),
  )
  let endMiddle = startMiddle + middleSlots - 3 // Subtract 3 to account for 2 ellipses

  // Adjust if end exceeds the right limit
  if (endMiddle > lastPage - boundaryCount) {
    endMiddle = lastPage - boundaryCount
    startMiddle = Math.max(boundaryCount + 1, endMiddle - middleSlots + 3)
  }

  // Determine if ellipsis is needed
  const needsLeftEllipsis = startMiddle > boundaryCount + 1
  const needsRightEllipsis = endMiddle < lastPage - boundaryCount

  if (!needsLeftEllipsis && needsRightEllipsis) {
    // Only right ellipsis: show middleSlots - 1 pages
    startMiddle = boundaryCount + 1
    endMiddle = boundaryCount + middleSlots - 1
  } else if (needsLeftEllipsis && !needsRightEllipsis) {
    // Only left ellipsis: show middleSlots - 1 pages
    endMiddle = lastPage - boundaryCount
    startMiddle = endMiddle - middleSlots + 2
  } else if (!needsLeftEllipsis && !needsRightEllipsis) {
    // No ellipsis: show all pages between boundaries
    startMiddle = boundaryCount + 1
    endMiddle = lastPage - boundaryCount
  }

  // Add start boundary pages
  for (let i = 1; i <= boundaryCount; i++) {
    pages.push(i)
  }

  // Left ellipsis
  if (needsLeftEllipsis) pages.push(NaN)

  // Middle pages
  for (let i = startMiddle; i <= endMiddle; i++) {
    pages.push(i)
  }

  // Right ellipsis
  if (needsRightEllipsis) pages.push(NaN)

  // End boundary pages
  for (let i = lastPage - boundaryCount + 1; i <= lastPage; i++) {
    pages.push(i)
  }

  return pages
}

export function Pagination({
  currentPage,
  lastPage,
  maxPageLinks = 7,
  setCurrentPage,
  boundaryCount = 1,
}: PaginationProps) {
  const containerClasses = "flex flex-wrap justify-center"
  const pageNums = getPaginationItems(
    currentPage,
    lastPage,
    maxPageLinks,
    boundaryCount,
  )

  return (
    <nav className={containerClasses} aria-label="Pagination">
      {/* Previous */}
      <PageLink
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <Icon name="Chevron-left" size={14} />
      </PageLink>

      {/* Page Numbers and Ellipses */}
      {pageNums.map((pageNum, idx) => {
        const isEllipsis = isNaN(pageNum)

        const handleClick = isEllipsis
          ? undefined
          : () => setCurrentPage(pageNum as number)

        return (
          <PageLink
            key={idx}
            active={currentPage === pageNum}
            disabled={isEllipsis}
            onClick={handleClick}
          >
            {!isEllipsis ? pageNum : "..."}
          </PageLink>
        )
      })}

      {/* Next  */}
      <PageLink
        disabled={currentPage === lastPage}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <Icon name="Chevron-right" size={14} />
      </PageLink>
    </nav>
  )
}

export default Pagination
