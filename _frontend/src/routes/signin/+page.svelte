<script lang="ts">
    import Button from "$components/elements/Button.svelte"
    import Popup from "$reusables/Popup.svelte"

    const login = async () => {
        const request = await fetch(`/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: (
                    document.getElementById("username") as HTMLInputElement
                ).value,
                password: (
                    document.getElementById("password") as HTMLInputElement
                ).value
            })
        })

        if (request.ok) {
            window.location.href = "/Secret"
        } else {
            window.alert(await request.text())
        }
    }
</script>

<Popup hideHeader disableMobileFullscreen>
    <h1>Sign in to Stash</h1>

    <div class="inputs">
        <label for="username">Username</label>
        <input type="text" id="username" />
        <label for="password">Password</label>
        <input
            type="password"
            id="password"
            onkeydown={e => {
                if (e.key === "Enter") {
                    login()
                }
            }}
        />
    </div>

    {#snippet actionsRight()}
        <Button card icon={null} highlighted onclick={login}>Login</Button>
    {/snippet}
</Popup>

<style lang="scss">
    h1 {
        margin-top: 0;
    }

    .inputs {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem;
        align-items: center;
    }
</style>
