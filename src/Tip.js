import './App.css';

export default function Tip() {

    return (
        <div style={{
            position: 'fixed',
            right: '15px',
            bottom: '10px',
            fontSize: '12px',
            lineHeight: '10px',
            textAlign: 'right'
        }}>
            <p className="compact-paragraph">
            🌞 Support my <a href="https://gitcoin.co/grants/2393/dex-whales">Gitcoin Grant</a>
            </p>
            <p className="compact-paragraph">
                Developer: <a href="https://twitter.com/artoriamaster">@artoriamaster</a>
            </p>
            <p className="compact-paragraph">
                Twitter Bot: <a href="https://twitter.com/dex_whales">@dex_whales</a>
            </p>
            <p className="compact-paragraph">
                Github: <a href="https://github.com/wjw12/dexwhales">DEX Whales</a>
            </p>

        </div>
    )
}