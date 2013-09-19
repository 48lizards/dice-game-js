var Die = {

    sideNames : {
        NINE  : 0,
        TEN   : 1,
        JACK  : 2,
        QUEEN : 3,
        KING  : 4,
        ACE   : 5
    },

    getSides : function() {
        return [this.sideNames.NINE,
                this.sideNames.TEN,
                this.sideNames.JACK,
                this.sideNames.QUEEN,
                this.sideNames.KING,
                this.sideNames.ACE];
    },

    getRandomSide : function() {
        return Math.floor(Math.random() * 6);
    },

    getDie : function(sideFacingUp, hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : true;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        return {sideFacingUp : sideFacingUp,
                hasBeenRolledThisTurn : hasBeenRolledThisTurn,
                isUnderCup : isUnderCup};
    },

    getRolledDie : function(hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : true;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        return this.getDie(this.getRandomSide(), hasBeenRolledThisTurn, isUnderCup);
    }
}

var Hand = {
    handTypes : {
        NOTHING         : 0,
        PAIR            : 1,
        TWO_PAIR        : 2,
        THREE_OF_A_KIND : 3,
        FULL_HOUSE      : 4,
        FOUR_OF_A_KIND  : 5,
        FIVE_OF_A_KIND  : 6
    },

    getHand : function(dieList) {
        var hand = [];
        if (dieList) {
            for (var i = 0; i < 5 && i < dieList.length; i++) {
                hand.push(Die.getDie(dieList[i]));
            }
            var diceToAdd = Die.getSides().sort().reverse().filter(function(side) { return hand.indexOf(side) == -1; });
            while (hand.length < 5) {
                hand.push(Die.getDie(diceToAdd.pop()));
            }
        } else {
            for (var i = 0; i < 5; i++) {
                hand.push(Die.getRolledDie());
            }
        }
        return hand;
    },

    getLowestHand : function() {
        return this.getHand([Die.sideNames.TEN, Die.sideNames.JACK, Die.sideNames.QUEEN, Die.sideNames.KING, Die.sideNames.ACE]);
    },

    getScore : function(hand) {
        if (this.kind(hand, 5)) {
            return [this.handTypes.FIVE_OF_A_KIND, this.kind(hand, 5)]; 
        } else if (this.kind(hand, 4)) {
            return [this.handTypes.FOUR_OF_A_KIND, this.kind(hand, 4), this.kind(hand, 1)];
        } else if (this.kind(hand, 3) && this.kind(hand, 2)) {
            return [this.handTypes.FULL_HOUSE, this.kind(hand, 3), this.kind(hand, 2)];
        } else if (this.kind(hand, 3)) {
            return [this.handTypes.THREE_OF_A_KIND, this.kind(hand, 3), Math.max.apply(Math, this.kind(hand, 1)), Math.min.apply(Math, this.kind(hand, 1))];
        } else if (Object.prototype.toString.call(this.kind(hand, 2)) === '[object Array]') {
            return [this.handTypes.TWO_PAIR, Math.max.apply(Math, this.kind(hand, 2)), Math.min.apply(Math, this.kind(hand, 2))];
        } else if (this.kind(hand, 2)) {
            return [this.handTypes.PAIR, this.kind(hand, 2)];
        } else {
            return [this.handTypes.NOTHING];
        }
    },

    kind : function(hand, num) {
        var matches = [];
        for (var i = 0; i < Die.getSides().length; i++) {
            handWithOneSideOnly = hand.filter(function(dieInHand) { return dieInHand.sideFacingUp == Die.getSides()[i] });
            if (handWithOneSideOnly.length == num) {
                matches.push(Die.getSides()[i]);
            }
        }
        if (matches.length == 1) {
            return matches[0];
        } else if (matches.length == 0) {
            return false;
        } else {
            return matches;
        }
    },

    reroll : function(hand, dieNum) {
        var newHand = hand.slice(0);
        newHand[dieNum] = Die.getRolledDie(true, hand[dieNum].isUnderCup);
        return newHand;
    },

    resetRolls : function(hand) {
        var newHand = [];
        for (var i = 0; i < hand.length; i++) {
            newHand.append(Die.getDie(hand[i].sideFacingUp, false, hand[i].isUnderCup));
        }
        return newHand;
    },
}

var HandTextView = {
    sideNames : ['9', '10', 'J', 'Q', 'K', 'A'],

    getDescription : function(hand) {
        if (Hand.kind(hand, 5)) {
            return 'Five ' + this.sideNames[Hand.kind(hand, 5)] + 's';
        } else if (Hand.kind(hand, 4)) {
            if (Hand.kind(hand, 1) == Die.sideNames.ACE) {
                return 'Four ' + this.sideNames[Hand.kind(hand, 4)] + 's and an ' + this.sideNames[Hand.kind(hand, 1)];
            } else {
                return 'Four ' + this.sideNames[Hand.kind(hand, 4)] + 's and a ' + this.sideNames[Hand.kind(hand, 1)];
            }
        } else if (Hand.kind(hand, 3) && Hand.kind(hand, 2)) {
            return this.sideNames[Hand.kind(hand, 3)] + 's full of ' + this.sideNames[Hand.kind(hand, 2)] + 's';
        } else if (Hand.kind(hand, 3)) {
            if (Math.max.apply(Math, Hand.kind(hand, 1)) == Die.sideNames.ACE) {
                return 'Three ' + this.sideNames[Hand.kind(hand, 3)] + 's and an ' + this.sideNames[Math.max.apply(Math, Hand.kind(hand, 1))];
            } else {
                return 'Three ' + this.sideNames[Hand.kind(hand, 3)] + 's and a ' + this.sideNames[Math.max.apply(Math, Hand.kind(hand, 1))];
            }
        } else if (Object.prototype.toString.call(Hand.kind(hand, 2)) === '[object Array]') {
            return this.sideNames[Math.max.apply(Math, Hand.kind(hand, 2))] + 's and ' + this.sideNames[Math.min.apply(Math, Hand.kind(hand, 2))] + 's';
        } else if (Hand.kind(hand, 2)) {
            return 'Pair of ' + this.sideNames[Hand.kind(hand, 2)] + 's';
        } else {
            return 'Nothing';
        }
    }

}

