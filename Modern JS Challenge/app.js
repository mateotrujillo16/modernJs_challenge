"use strict";
// Function runs immediately when code is ran
// Model
// Budget Controller
const budgetController = (() => {
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calcPercentage(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }

        getPercentage() {
            return this.percentage;
        }
    }

    class Income extends Expense {
        constructor(id, description, value) {
            super(id, description, value);
        }
    }

    const data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    const calculateTotal = (type) => {
        // let sum = 0;

        // data.allItems[type].forEach((item) => {
        //     sum += item.value;
        // });

        // Loops through array to generate sum
        let sum = data.allItems[type].reduce((accumulator, currentValue) => {
            return accumulator + currentValue.value;
        }, 0);

        data.totals[type] = sum;
    };

    return {
        addItem: (type, des, val) => {
            let newItem, ID;
            // Reviews all elements in array then locates last index at a given type to assign ID value
            // ID = last ID + 1

            // Create a new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id;
            } else {
                ID = 0;
            }

            // Creates mew item based on 'inc' or 'exp' type
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure at given type
            data.allItems[type].push(newItem);
            // return new element to be accessed later in other functions
            return newItem;
        },

        deleteItem: (type, id) => {
            let ids, index;

            // Creates an array of ids
            ids = data.allItems[type].map((current) => {
                return current.id;
            });

            // Grabs the index of the element passed in
            index = ids.indexOf(id);

            // if item exist. remove from array
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: () => {
            // Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");
            // Calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Checks if over budget
            if (data.budget < 0) {
                alert("You are over budget");
                document.querySelector(".budget__value").style.color =
                    "#ff5049";
            } else {
                document.querySelector(".budget__value").style.color = "white";
            }

            if (data.totals.inc > 0) {
                // Calculate the percentage of income that we spent
                data.percentage = Math.round(
                    (data.totals.exp / data.totals.inc) * 100
                );
            } else {
                data.percentage = -1;
            }
        },

        // Calculate percentage of each expense added to array
        calculatePercentages: () => {
            data.allItems.exp.forEach((current) => {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: () => {
            // Retrieve array of all percentages
            const allPerc = data.allItems.exp.map((current) => {
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: () => {
            console.log(data);
        },
    };
})();

// View (UI Controller)
const UIController = (() => {
    const DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };

    const formatNumber = (num, type) => {
        let numSplit, int, dec;
        // Removes sign
        num = Math.abs(num);
        // Creates two decimal places
        num = num.toFixed(2);

        // Separate num and decimal into two separate indexes in an array.
        numSplit = num.split(".");
        // Holds Integer
        // And parses using regex command
        int = numSplit[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // BreakDown
        // (/\B) = Escaping then finding a match not at the beginning of string
        // (?=exp) = Matches any string that is followed by a specific string exp
        // (\d) = Find a digit
        // {3} = Specifies sequence
        // ?!\d = Matches any string that is not followed by a specific string d
        // g = Perform global check

        // Holds Decimal
        dec = numSplit[1];

        // Checks which type was passed in then provides a given sign accordingly
        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    // Manuel for each method to loop over list.
    let nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: () => {
            // Return an object in order to return multiple values
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMstrings.inputValue).value
                ),
            };
        },

        // Method to add newly created item to the DOM
        addListItem: ({ id, description, value }, type) => {
            let html, newHtml, element;

            // Checks what type the item has in order to use the correct html item
            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMstrings.expensesContainer;
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace("%id%", id);
            newHtml = newHtml.replace("%description%", description);
            newHtml = newHtml.replace("%value%", formatNumber(value, type));

            // Append value to provided DOM element
            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: (selectorID) => {
            const el = document.getElementById(selectorID);

            // Remove element with specified ID from DOM
            el.parentNode.removeChild(el);
        },

        // Create a method to clear the input fields inputDescription: ".add__description", inputValue: ".add__value", from the array after submit

        clearFields: () => {
            let fields, fieldsArr;
            // Grab both DOM elements
            fields = document.querySelectorAll(
                DOMstrings.inputDescription + " , " + DOMstrings.inputValue
            );

            // Convert list to Array. Lists do not have access to array methods
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((element) => {
                element.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: ({ budget, totalInc, totalExp, percentage }) => {
            let type;

            budget > 0 ? (type = "inc") : (type = "exp");

            if (budget !== 0) {
                document.querySelector(
                    DOMstrings.budgetLabel
                ).textContent = formatNumber(budget, type);
            } else {
                document.querySelector(DOMstrings.budgetLabel).textContent =
                    "0.00";
            }
            document.querySelector(
                DOMstrings.incomeLabel
            ).textContent = formatNumber(totalInc, "inc");
            document.querySelector(
                DOMstrings.expensesLabel
            ).textContent = formatNumber(totalExp, "exp");

            if (percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    "---";
            }
        },

        displayPercentage: (percentages) => {
            let fields = document.querySelectorAll(
                DOMstrings.expensesPercLabel
            );

            // When called pass in fields and callback function to handle data
            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        displayMonth: () => {
            let now, months, year, month;

            // Current Date
            now = new Date();

            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent =
                months[month] + " " + year;
        },

        changedType: () => {
            const fields = document.querySelectorAll(
                DOMstrings.inputType +
                    "," +
                    DOMstrings.inputDescription +
                    "," +
                    DOMstrings.inputValue
            );

            nodeListForEach(fields, (current) => {
                current.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },

        getDOMstrings: () => {
            return DOMstrings;
        },
    };
})();

// Function to use both model and view functions within one function
// Controller (Global App Controller)
const controller = ((budgetCtrl, UICtrl) => {
    // Store event handlers here to delegates what functionality is passed to the attached controllers

    const setupEventListeners = () => {
        const DOM = UICtrl.getDOMstrings();

        // If add btn is pressed run ctrlAddItem Function
        document
            .querySelector(DOM.inputBtn)
            .addEventListener("click", ctrlAddItem);

        // Listens for keypress from keyboard(Condition: Enter key) then runs ctrlAddItem function
        document.addEventListener("keypress", (event) => {
            // if (event.keyCode === 13 || event.which === 13) {
            if (event.key === "Enter") {
                ctrlAddItem();
            }
        });

        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);

        document
            .querySelector(DOM.inputType)
            .addEventListener("change", UICtrl.changedType);
    };

    const updateBudget = () => {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        const budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    const updatePercentages = () => {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        const percentages = budgetCtrl.getPercentage();
        // 3. Update he UI with the new percentages
        UICtrl.displayPercentage(percentages);
    };

    const ctrlAddItem = () => {
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        } else if (input.description === "") {
            alert("Description Needed");
        } else if (isNaN(input.value)) {
            alert("Valid Number Needed");
        }
    };

    const ctrlDeleteItem = (event) => {
        let itemID, splitID, type, ID;

        // Back step in path to retrieve container id  value. It is not a best practice but we can use because we copy that section of the HTML
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // If ID exist
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI

            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: () => {
            console.log("Application has started.");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        },
    };
})(budgetController, UIController); 

// begin the app or nothing will ever run because the event listeners are in a private function
controller.init();
