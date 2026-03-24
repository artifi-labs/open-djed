import { useTranslations } from "next-intl"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function seed() {
  const t = useTranslations()

  t("common.months.january")
  t("common.months.february")
  t("common.months.march")
  t("common.months.april")
  t("common.months.may")
  t("common.months.june")
  t("common.months.july")
  t("common.months.august")
  t("common.months.september")
  t("common.months.october")
  t("common.months.november")
  t("common.months.december")

  t("common.weekDays.monday")
  t("common.weekDays.tuesday")
  t("common.weekDays.wednesday")
  t("common.weekDays.thursday")
  t("common.weekDays.friday")
  t("common.weekDays.saturday")
  t("common.weekDays.sunday")

  t("common.periodItems.today")
  t("common.periodItems.thisWeek")
  t("common.periodItems.lastWeek")
  t("common.periodItems.thisMonth")
  t("common.periodItems.lastMonth")
  t("common.periodItems.thisQuarter")
  t("common.periodItems.thisYear")

  t("common.period.day")
  t("common.period.week")
  t("common.period.month")
  t("common.period.year")
  t("common.period.all")

  t("orders.status.all")
  t("orders.status.created")
  t("orders.status.completed")
  t("orders.status.canceled")

  t("orders.filters.status.all")
  t("orders.filters.status.created")
  t("orders.filters.status.completed")
  t("orders.filters.status.canceled")

  t("simulator.whatIsSimulator.items.fees")
  t("simulator.whatIsSimulator.items.rewards")
  t("simulator.whatIsSimulator.items.feesEarned")
  t("simulator.whatIsSimulator.items.profitOrLoss")
  t("simulator.whatIsSimulator.items.totalEstimatedPNL")

  t("errors.404.pageTitle")
  t("errors.404.title")
  t("errors.404.content.content1")
  t("errors.404.content.content2")
  t("errors.404.button.text")

  t("dashboard.whatIsOpenDjed.whyOpenDjed.items.protocolCompatible")
  t("dashboard.whatIsOpenDjed.whyOpenDjed.items.openSource")
  t("dashboard.whatIsOpenDjed.whyOpenDjed.items.communityFirst")
  t("dashboard.whatIsOpenDjed.whyOpenDjed.items.reliable")
  t("dashboard.whatIsOpenDjed.whyOpenDjed.items.globalAccess")
  t("dashboard.whatIsOpenDjed.whyOpenDjed.items.transparentFees")

  t("dashboard.burnFee")
}
