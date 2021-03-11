const psion = game.user.character

let psiPointsPerUseLimit = Math.ceil(psion.data.data.details.level / 2)

class TelekineticForce {
    /**
     * 
     * @param {Set} targets 
     * @param {Number} hammering 
     * @param {Boolean} crushing 
     * @param {Number} zoneOf 
     * @param {Number} hurling 
     * @param {Array} hurlingDirections 
     */
    constructor(targets, hammering = 0, crushing = false, zoneOf = 0, hurling = 0, hurlingDirections = []) {
        this.targets = targets || new Set()
        this.affectedTargets = new Set()
        this.missedTargets = new Set()

        this.hammering = hammering
        this.crushing = crushing
        this.zoneOf = zoneOf
        this.hurling = hurling
        this.hurlingDirections = hurlingDirections

        this.psiPointsCost = hammering + hurling + (crushing ? 2 : 0) + zoneOf
    }

    performPsionicPower() {
        if (this.psiPointsCost > psiPointsPerUseLimit) {
            ui.notifications.warn(`You can spend at most ${psiPointsPerUseLimit} Psi Points at once`)
            return false
        }

        const resourceKey = Object.keys(actor.data.data.resources).filter(k => actor.data.data.resources[k].label === "Psi Points").shift();
        if (resourceKey && (actor.data.data.resources[resourceKey].value < this.psiPointsCost)) {
            ui.notifications.warn("You don't have enough Psi Points available")
            return false
        }

        if (this.targets.size === 0) {
            ui.notifications.warn("Select at least one target")
            return false
        }

        if (this.targets.size > 1 && this.zoneOf === 0) {
            ui.notifications.warn("You must use the Zone Of modifier to have more than one target")
            return false
        }

        let rolls = []
        for (let target of this.targets) {
            rolls.push(this.rollSave(target))
        }

        Promise.all(rolls).then(() => {
            for(let affectedTarget of this.affectedTargets) {
                this.applyEffect(affectedTarget)
            }
        })

        actor.data.data.resources[resourceKey].value -= this.psiPointsCost
    }

    /**
     * 
     * @param {Token} target 
     * @returns {Promise<Roll>}
     */
    rollSave(target) {
        const psionicPowerDC = actor.data.data.abilities["int"].dc
        return target.rollAbilitySave("str").then(saveRoll => {
            if(saveRoll.evaluate().result < psionicPowerDC) {
                this.affectedTargets.add(target)
            } else {
                this.missedTargets.add(target)
            }
        })
    }

    applyEffect(target) {
        const dmgFormula = `${this.hammering + 1}d10`
        let dmgRoll = new Roll(dmgFormula)
        dmgRoll.evaluate()
        target.applyDamage(dmgRoll.result)
    }
}

const dialog = new Dialog({
    title: 'Telekinetic Force',
    content: `
    <form>
        <div>Max psi points usable = ${psiPointsPerUseLimit}</div>
        <label>Hammering</label>
        <input type="number" name="hammering" id="psiHammering">
    </form>
    `,
    buttons: {
        ok: {
            icon: "<i class='fas fa-check'></i>",
            label: `Ok`,
            callback: (html) => {
                // get values from form and instantiate the attack
                const hammering = html.find("#psiHammering").value

                new TelekineticForce(game.user.targets, hammering)
            }
        }
    },
    default: "ok"
})

console.log("Executing Telekinetic Force")
dialog.render(true)