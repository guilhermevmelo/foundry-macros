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
        this.psionicPowerDC = actor.data.data.abilities["int"].dc

        this.hammering = +hammering
        this.crushing = crushing && true
        this.zoneOf = +zoneOf
        this.hurling = +hurling
        this.hurlingDirections = hurlingDirections

        this.psiPointsCost = this.hammering + this.hurling + (this.crushing ? 2 : 0) + this.zoneOf
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
            rolls.push(this.rollSave(target.actor))
        }

        Promise.all(rolls).then(() => {
            for (let affectedTarget of this.affectedTargets) {
                this.applyEffect(affectedTarget)
            }
        })

        actor.data.data.resources[resourceKey].value -= this.psiPointsCost

        if (actor.sheet.rendered) {
            actor.render(true)
        }
    }

    /**
     * 
     * @param {Token} target 
     * @returns {Promise<Roll>}
     */
    rollSave(target) {
        return target.rollAbilitySave("str").then(saveRoll => {
            if (saveRoll.total < this.psionicPowerDC) {
                this.affectedTargets.add(target)
            } else {
                this.missedTargets.add(target)
            }
        })
    }

    applyEffect(target) {
        const dmgFormula = `${this.hammering + 1}d10`
        let dmgRoll = game.dnd5e.dice.damageRoll({
            parts: [dmgFormula],
            actor,
            data: target,
            allowCritical: false
        }).then(dmgRoll => {
            target.applyDamage(dmgRoll.total)
            if (target.sheet.rendered) {
                target.render(true)
            }
        })
    }
}

const dialog = new Dialog({
    title: 'Telekinetic Force',
    content: `
    <form>
        <div>Max psi points usable = ${psiPointsPerUseLimit}</div>
        <label>Hammering</label>
        <input type="number" name="hammering" id="psiHammering" value="0">
    </form>
    `,
    buttons: {
        ok: {
            icon: "<i class='fas fa-check'></i>",
            label: `Ok`,
            callback: (html) => {
                // get values from form and instantiate the attack
                const hammering = html.find("#psiHammering")[0].value

                const tf = new TelekineticForce(game.user.targets, hammering)
                tf.performPsionicPower()
            }
        }
    },
    default: "ok"
})

console.log("Executing Telekinetic Force")
dialog.render(true)