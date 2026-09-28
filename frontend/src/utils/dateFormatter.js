export const getMonthInMacedonian = (date) => {
    if(!date) {
        throw new Error("Date is required");
    }

    if(!(date instanceof Date)) {
        date = new Date(date);
    }

    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }

    switch (date.getMonth()) {
    case 0:
        return "јануари";
    case 1:
        return "февруари";
    case 2:
        return "март";
    case 3:
        return "април";
    case 4:
        return "мај";
    case 5:
        return "јуни";
    case 6:
        return "јули";
    case 7:
        return "август";
    case 8:
        return "септември";
    case 9:
        return "октомври";
    case 10:
        return "ноември";
    case 11:
        return "декември";
    default:
        throw new Error("Invalid month");
    }
}