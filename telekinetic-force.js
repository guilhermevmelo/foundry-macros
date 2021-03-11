const psion = game.user.character

let maxPsiPointsExpendableAtOnce = Math.ceil(psion.data.data.details.level / 2)

class TelekineticForce {
    constructor(target, hammering = 0, crushing = 0, zoneOf = 0, hurling = 0, hurlingDirections = []) {
        this.target = target
        
        this.hammering = hammering
        this.crushing = crushing
        this.zoneOf = zoneOf
        this.hurling = hurling
        this.hurlingDirections = hurlingDirections

        this.consumedPsiPoints = hammering + hurling + crushing + zoneOf
    }
}

const dialog = new Dialog({
    title: 'Telekinetic Force',
    content: `
    <form>
        <div>Max psi points usable = ${maxPsiPointsExpendableAtOnce}</div>
        <label>Hammering</label>
        <input type="number" name="hammering">
    </form>
    `,
    buttons: {
        ok: {
            icon: "<i class='fas fa-check'></i>",
            label: `Ok`,
            callback: (html) => {
                // get values from form and instantiate the attack
            
            }
        }
    },
    default: "ok"
})

console.log("Executing Telekinetic Force", actor, game.user.targets)
dialog.render(true)