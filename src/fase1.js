//Define a classe da cena
class fase1 extends Phaser.Scene {
    constructor() {
        super('fase1'); //Nome da cena
    }

    preload() { // Função que carrega os assets da cena
        //Carrega o sprite sheet do nosso personagem
        this.load.spritesheet('dipper', 'assets/fase/DipperSpriteSheet.png', {
            frameWidth: 118, // Define a largura de cada frame
            frameHeight: 160, // Define a altura de cada frame
        });
        //Carrega o mapa do nosso jogo feito no Tiled
        this.load.tilemapTiledJSON('mapa', 'assets/fase/dipperGame.json');
        //Carrega o tileset (conjunto de imagens) usado na construção do mapa no Tiled
        this.load.image('tilesetFinal', 'assets/fase/tilesetFinal.png');
        //Carrega as imagens que serão usadas nessa cena 
        this.load.image('tela', 'assets/fase/tela.png');
        this.load.image('fogo', 'assets/fase/fogo.png');
        this.load.image('bill', 'assets/fase/bill.png');
        //Carrega a música de fundo da fase
        this.load.audio('musica', 'assets/fase/musica.mp3');
    }

    create() {
        //Adiciona a música ao jogo que irá tocar em loop, ou seja, sem parar
        this.musica = this.sound.add('musica', { loop: true });
        //Inicia a música
        this.musica.play();
        //Cria uma variável que vai armazenar a pontuação do jogador, começando com 0
        this.pontuacao = 0;
        //Variável que determina se o jogador está 'socando', ou seja, se a animação de soco está passando, como nada aconteceu ainda, a variável começa com o valor false
        this.socoAtivado = false;
        //Variável que armazena o tempo que cada soco demora
        this.socoTempo = 0;
        //Variável que armazena as vidas do jogador, no começo do jogo ele só tem uma vida
        this.vidas = 1;
        //Variável que armazena a quantidade de diários coletados pelo jogador, no começo do jogo esse valor é 0
        this.diariosColetados = 0;

        // Lista de bills(2 inimigos que vão atirar bolas de fogo no nosso player), a lista começa vazia
        this.bills = [];

        //Adição do mapa a tela do jogo
        this.mapa = this.make.tilemap({ key: 'mapa' });

        //Adição do tileset (conjunto de imagens) ao jogo
        this.tileset = this.mapa.addTilesetImage('tilesetFinal', 'tilesetFinal');

        //Adição da imagem 'tela'
        this.add.image(450, 300, 'tela');

        // Array que vai armazenar as layers(camadas) do mapa 
        this.layers = [
            this.mapa.createLayer('overlap', this.tileset), 
            this.mapa.createLayer('diarios', this.tileset),
            this.mapa.createLayer('fundo', this.tileset),
            this.mapa.createLayer('plataforma', this.tileset),
            this.mapa.createLayer('coracao', this.tileset),
            this.mapa.createLayer('lava', this.tileset)
        ];

        // Adiciona colisão na camada das plataformas do mapa, ou seja, agora o personagem nãoo vai mais ultrapassar o chão
        this.layers[3].setCollisionByProperty({ collider: true });

        // Cria o personagem Dipper
        this.dipper = this.physics.add.sprite(80, 460, 'dipper');
        //Muda o tamanho da hitbox do personagem para que ele tenha uma área de colisão de 50x100 pixels
        this.dipper.setSize(50, 100);
        //Não deixa que o personagem saia dos limites da tela 
        this.dipper.setCollideWorldBounds(true);

        // Adiciona os bills(inimigos) à lista
        this.bills.push(this.physics.add.staticImage(2320, 340, 'bill').setImmovable(true));
        this.bills.push(this.physics.add.staticImage(2560, 140, 'bill').setImmovable(true).setFlipX(true));
        //.setImmovable(true) impede que os bills se movam ao colidir com outros objetos
        //.setFlipX(), espelha a imagem
        // Grupos de bolas de fogo para cada um dos bills(inimigos)
        this.bolasDeFogoBill1 = this.physics.add.group({ allowGravity: false }); 
        this.bolasDeFogoBill2 = this.physics.add.group({ allowGravity: false });
        //As bolas de fogo não serão afetadas pela gravidade, elas vão seguir em linha reta

        // Configurando colisões
        this.physics.add.collider(this.dipper, this.layers[3]); // colisão do personagem com a plataforma
        // Sobreposição do personagem com os diários, chamando a função coletarDiario
        this.physics.add.overlap(this.dipper, this.layers[1], this.coletarDiario, null, this); 
        // Sobreposição do personagem com os corações, chamando a função coletarCoracao
        this.physics.add.overlap(this.dipper, this.layers[4], this.coletarCoracao, null, this); 
        // Sobreposição do personagem, chamando a função tocarLava
        this.physics.add.overlap(this.dipper, this.layers[5], this.tocarLava, null, this); 
        // Sobreposição do personagem com as bolas de fogo, chamando o método atingidoPorFogo
        this.physics.add.overlap(this.dipper, this.bolasDeFogoBill1, this.atingidoPorFogo, null, this);
        this.physics.add.overlap(this.dipper, this.bolasDeFogoBill2, this.atingidoPorFogo, null, this);

        // Inicia o disparo das bolas de fogo após 3 segundos
        this.time.addEvent({
            delay: 3000, //Define o tempo que o jogo deve esperar antes de executar a função
            callback: this.lancarBolaDeFogo, //A função que será chamada após 3 segundos
            callbackScope: this,  // Define o contexto (escopo) da função, garantindo que 'this' se refira à cena atual
            loop: true, // esse evento vai continuar acontecendo a cada 3 segundos, pois o loop está ativado
        });

        //Define que as câmeras devem seguir o personagem Dipper, o que cria um estilo de gameplay parecido com Super Mario Bros
        this.cameras.main.startFollow(this.dipper);
        // Define os limites da câmera para que ela não ultrapasse os limites do mapa, mantendo a visualização dentro do cenário
        this.cameras.main.setBounds(0, 0, 3392, 640);
        // Define os limites do mundo, ou seja, a área onde os objetos podem se mover. 
        this.physics.world.setBounds(0, 0, 3392, 640);

        //Adiciona o texto que vai exibir a pontuação do jogador
        this.textoPontuacao = this.add.text(50, 100, 'Pontuação: 0', { //Define a posição do texto e o conteúdo do texto
            fontSize: '24px', //Tamanho da fonte
            fontFamily: 'Arial', //Tipo de fonte
            color: '#000000', //Cor do texto, no caso, branco
            backgroundColor: '#5ce1e6', //Cor do fundo do texto, que aqui é azul claro
        });

        //Adiciona o texto que vai exibir a quantidade de vidas do jogador
        this.textoVidas = this.add.text(50, 77, 'Vidas: 1', { //Define a posição do texto na tela e o conteúdo do texto
            fontSize: '24px', //Tamanho da fonte
            fontFamily: 'Arial', //Tipo de fonte
            color: '#000000', //Cor do texto, no caso, branco
            backgroundColor: '#5ce1e6', //Cor do fundo do texto, que aqui é azul claro
        });

        //Variável que armazena as setas do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        //Variável que armazena a letra F do teclado
        this.F = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        // Configurando animações
        this.anims.create({ //Cria uma animação
            key: 'ganhou', // Nome da animação
            //Determina em qual frame a animação começa e em qual ela termina 
            frames: this.anims.generateFrameNumbers('dipper', { start: 0, end: 2 }),
            //Determina a quantidade de quadros por segundo
            frameRate: 6,
            //Determina que a animação vai se repetir infinitamente
            repeat: -1,
        });

        //A lógica se estende para as animações a seguir

        this.anims.create({
            key: 'morreu',
            frames: this.anims.generateFrameNumbers('dipper', { start: 3, end: 9 }),
            // Define a quantidade de quadros por segundo (10 fps)
            frameRate: 10,
            // Define que a animação vai rodar uma vez apenas (não se repetirá)
            repeat: 0,
        });

        this.anims.create({
            key: 'socando',
            frames: this.anims.generateFrameNumbers('dipper', { start: 10, end: 13 }),
            frameRate: 15,
            repeat: 0,
        });

        this.anims.create({
            key: 'parado',
            frames: this.anims.generateFrameNumbers('dipper', { start: 14, end: 20 }),
            frameRate: 12,
            repeat: -1,
        });

        this.anims.create({
            key: 'correndo',
            frames: this.anims.generateFrameNumbers('dipper', { start: 21, end: 26 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'pulando',
            frames: this.anims.generateFrameNumbers('dipper', { start: 27, end: 32 }),
            frameRate: 10,
            repeat: 0,
        });
    }

    // Controle do movimento do personagem
    update(time, delta) { //Função que atualiza os elementos na tela 
        //Se o jogador apertar a seta para a direita...
        if (this.cursors.right.isDown) {
            //A velocidade do personagem no eixo X aumenta, ou seja, ele anda para a direita
            this.dipper.setVelocityX(120); 
            //.setFlipX() é usado pra espelhar a imagem, mas nesse caso tá como false, então a imagem original não é espelhada 
            this.dipper.setFlipX(false);
            // Se o jogador apertar a seta para cima enquanto segura a seta para a direita...
            if (this.cursors.up.isDown) {
                // A velocidade no eixo Y diminui ou seja, o personagem pula
                this.dipper.setVelocityY(-150); 
                //Se a animação atual do personagem for diferente de pulando...
                if (this.dipper.anims.currentAnim?.key !== 'pulando') {
                    this.dipper.anims.play('pulando', true); // Inicia a animação com o nome 'pulando'
                }
            //Se o jogador não apertou a seta para cima enquanto apertava a seta para a direita
            //E se a animação atual do personagem for diferente de correndo...
            } else if (this.dipper.anims.currentAnim?.key !== 'correndo') {
                this.dipper.anims.play('correndo', true); //inicia a animação com o nome 'correndo'
            }
        //Se o jogador apertar a seta para a esquerda...
        } else if (this.cursors.left.isDown) {
            //A velocidade do personagem no eixo X [diminui, ou seja, ele anda para a esquerda
            this.dipper.setVelocityX(-120);
            //Espelha a imagem do personagem
            this.dipper.setFlipX(true);
            // Se o jogador apertar a seta para cima enquanto segura a seta para a esquerda...
            if (this.cursors.up.isDown) {
                // A velocidade no eixo Y diminui ou seja, o personagem pula
                this.dipper.setVelocityY(-150);
                //Se a animação atual do personagem for diferente de pulando...
                if (this.dipper.anims.currentAnim?.key !== 'pulando') {
                    //Inicia a animação 'pulando'
                    this.dipper.anims.play('pulando', true);
                }
            //Se o jogador não apertou a seta para cima enquanto apertava a seta para a esquerda
            //E se a animação atual do personagem for diferente de correndo...
            } else if (this.dipper.anims.currentAnim?.key !== 'correndo') {
                //Inicia a animação do personagem correndo
                this.dipper.anims.play('correndo', true);
            }
        //Se o jogador apertou a seta para cima...
        } else if (this.cursors.up.isDown) {
            // A velocidade no eixo Y diminui ou seja, o personagem pula
            this.dipper.setVelocityY(-150);
            //Se a animação atual do personagem for diferente de pulando...
            if (this.dipper.anims.currentAnim?.key !== 'pulando') {
                //Inicia a animação de pulo
                this.dipper.anims.play('pulando', true);
            }
        //Se o jogador apertou a seta para baixo...
        } else if (this.cursors.down.isDown) {
            // A velocidade no eixo Y aumenta ou seja, o personagem cai mais rápido
            this.dipper.setVelocityY(200);
            //Se a animação atual do personagem for diferente de pulando...
            if (this.dipper.anims.currentAnim?.key !== 'pulando') {
                //Inicia a animação de pulo
                this.dipper.anims.play('pulando', true);
            }

        // Se o jogador apertou a tecla 'F' E  a variável 'socoAtivado' está como false...
        } else if (Phaser.Input.Keyboard.JustDown(this.F) && !this.socoAtivado) {
            // Muda o valor da variável para true, indicando que o soco foi ativado
            this.socoAtivado = true;
            // Tira a movimentação horizontal do personagem
            this.dipper.setVelocityX(0);
            //Inicia a animação de soco
            this.dipper.anims.play('socando', true);
            // Define o tempo atual para o soco, controlando a duração do ataque
            this.socoTempo = time;

            // Verifica se a velocidade no eixo X do personagem é negativa, ou seja, se o personagem está se movendo para a esquerda
            if (this.dipper.body.velocity.x < 0) {
                //Se sim, manda espelhar a imagem do personagem para que ele dê o soco do lado "certo"
                this.dipper.setFlipX(true);
            // Verifica se a velocidade no eixo X do personagem é positiva, ou seja, se o personagem está se movendo para a direita
            } else if (this.dipper.body.velocity.x > 0) {
                // Se sim, deixa a imagem do personagem na posição original (não espelhada)
                this.dipper.setFlipX(false);
            }

        } else { //Se nenhuma tecla for ativada e socoAtivado for igual a false
            if (!this.socoAtivado) {
                //Tira a movimentação horizontal do personagem
                this.dipper.setVelocityX(0);
                //Inicia a animação com o nome 'parado'
                this.dipper.anims.play('parado', true);
            }
        }


        // Espera o soco terminar antes de permitir outro
        //Essa linha controla o tempo de duração do soco, permitindo que o jogador só possa realizar outro soco após 500 milissegundos
        if (this.socoAtivado && time > this.socoTempo + 500) {
            // Desativa a variável 'socoAtivado', permitindo que o jogador possa atacar novamente
            this.socoAtivado = false;
            //Se o jogador apertou a tecla para a direita OU para a esquerda...
            if (this.cursors.left.isDown || this.cursors.right.isDown) {
                //Inicia a animação de corrida do personagem
                this.dipper.anims.play('correndo', true);
            //Se nenhum dessas teclas foi ativada
            } else { 
                //Inicia a animação de 'parado
                this.dipper.anims.play('parado', true);
            }
        }

        // Chama a função 'verificarColisaoComBills' para checar se o soco do personagem atingiu algum dos inimigos (bills)
        this.verificarColisaoComBills();

        // Atualiza a posição dos textos em relação a câmera
        // O 'scrollX' e 'scrollY' da câmera fornecem a posição da câmera na tela,
        this.textoPontuacao.setPosition(this.cameras.main.scrollX + 50, this.cameras.main.scrollY + 50);
        this.textoVidas.setPosition(this.cameras.main.scrollX + 50, this.cameras.main.scrollY + 77);

        //Se o número de diários coletados for igual a 11, ou seja, igual ao total de diários disponíveis no jogo...
        if (this.diariosColetados === 11) {
            //O personagem para de se mover
            this.dipper.setVelocity(0, 0);
            //Inicia a animação "ganhou"
            this.dipper.anims.play('ganhou', true);
            //Depois de 2 segundos...
            this.time.delayedCall(2000, () => {
                this.musica.stop(); //Para a música que está tocando
                this.scene.start('ganhou'); // E inicia a cena 'ganhou'
            });
        }
    }

    // Método para coletar diários
    coletarDiario(dipper, tile) {
        // Verifica se o tile do diário existe (índice diferente de -1)
        if (tile.index !== -1) {
            //A pontuação do personagem aumenta em 10 pontos
            this.pontuacao += 10; 
            //O texto da pontuação é atualizado com o novo valor
            this.textoPontuacao.setText('Pontuação: ' + this.pontuacao);
            //Remove da camada 1, a camada dos diarios, o tile do diario que o personagem coletou
            this.layers[1].removeTileAt(tile.x, tile.y);  
            //Aumenta o número de diarios coletados em uma unidade
            this.diariosColetados += 1;
        }
    }

    // Método para coletar corações
    coletarCoracao(dipper, tile) {
        // Verifica se o tile do diário existe (índice diferente de -1)
        if (tile.index !== -1) {
            //Aumenta em uma unidade a vida do jogador
            this.vidas += 1;
            //Atualiza o texto das vida com o novo valor
            this.textoVidas.setText('Vidas: ' + this.vidas);
            //Remove da camada 4 o tile do coraçao que o personagem coletou
            this.layers[4].removeTileAt(tile.x, tile.y);  
        }
    }

    // Método para tocar na lava
    tocarLava(dipper, tile) {
        // Verifica se o tile do diário existe (índice diferente de -1)
        if (tile.index !== -1) {
            //Muda a cor do personagem para vermelho, indicando dano
            this.dipper.setTint(0xff0000);
            //Muda a vida do personagem para 0
            this.vidas = 0;
            //Atualiza o texto das vidas com o novo valor
            this.textoVidas.setText('Vidas: ' + this.vidas);
            //O personagem para de se mover
            this.dipper.setVelocity(0, 0);
            //Se a animação atual não for a  'morreu'
            if (this.dipper.anims.currentAnim?.key !== 'morreu') {
                //Inicia a animação 'morreu'
                this.dipper.anims.play('morreu', true);
            }
            // Aguarda a animação 'morreu' ser concluída antes de mudar de cena
            this.dipper.anims.currentAnim.onComplete = () => {
                // Aguarda 1 segundo após a animação 
                this.time.delayedCall(1000, () => {
                    this.musica.stop(); // Para a música atual
                    this.scene.start('perdeu'); // Muda para a cena 'perdeu'
                });
            };
        }
    }

    // Método para lançar bolas de fogo
    lancarBolaDeFogo() {
        //Verfica se o primeiro bill(inimigo) ainda está na cena 
        if (this.bills[0].active) {
            //Se sim, cria uma bola de fogo na posição do primeiro bill
            let bolaDeFogo = this.bolasDeFogoBill1.create(this.bills[0].x, this.bills[0].y, 'fogo');
            bolaDeFogo.setVelocityX(-200); // Movimenta a bola de fogo para a esquerda
        }
        //Verfica se o segundo bill(inimigo) ainda está na cena 
        if (this.bills[1].active) {
            //Se sim, cria uma bola de fogo na posição do segundo bill
            let bolaDeFogo = this.bolasDeFogoBill2.create(this.bills[1].x, this.bills[1].y, 'fogo');
            bolaDeFogo.setVelocityX(200); // Movimenta a bola de fogo para a direita
        }
    }

    // Método para tratar colisão com bola de fogo
    atingidoPorFogo(dipper, bolaDeFogo) {
        // Remove a bola de fogo do jogo assim que ela encosta no personagem
        bolaDeFogo.destroy();
        // Muda a cor do personagem para vermelho, indicando dano
        this.dipper.setTint(0xff0000);
        // Diminui em uma unidade a vida do personagem
        this.vidas -= 1;
        // Atualiza o texto das vidas com o novo valor
        this.textoVidas.setText('Vidas: ' + this.vidas);
        //Após 0,5 segundos...
        this.time.delayedCall(500, () => {
            this.dipper.clearTint(); //Tira a cor vermelha do personagem
        });

        //Se o número de vidas for menor ou igual a zero...
        if (this.vidas <= 0) {
            //Muda a cor do personagem para vermelho, indicando dano
            this.dipper.setTint(0xff0000);
            //Inicia a animação de morte
            this.dipper.anims.play('morreu', true);
            //Após 1 segundo...
            this.time.delayedCall(1000, () => {
                this.musica.stop(); // Para a música que está tocando
                this.scene.start('perdeu'); //Inicia a cena 'perdeu
            });
        }
    }

    // Método para verificar colisão com os bills durante o soco
    verificarColisaoComBills() {
        //Se o soco estiver ativado E se a animação atual for a do soco...
        if (this.socoAtivado && this.dipper.anims.currentAnim?.key === 'socando') {
            // Percorre a lista de bills usando um loop for
            for (let i = 0; i < this.bills.length; i++) {
                let bill = this.bills[i]; // Obtém o bill atual na iteração
                // Calcula a distância entre o personagem e o bill usando uma função
                let distancia = Phaser.Math.Distance.Between(this.dipper.x, this.dipper.y, bill.x, bill.y);

                //Se a distância for menor que 60 pixels...
                if (distancia < 60) { 
                    // Chama o método para destruir o bill e passa o bill correspondente e o grupo de bolas de fogo relacionado
                    this.destruirBill(bill, i === 0 ? this.bolasDeFogoBill1 : this.bolasDeFogoBill2);
                }
            }
        }
    }

    // Método para destruir um bill e suas bolas de fogo
    destruirBill(bill, grupoBolasDeFogo) {
        //Inicia a animação de 'soco'
        this.dipper.anims.play('socando', true);
        // Destroi o bill
        bill.destroy(); 
        // Destruoi todas as bolas de fogo associadas ao bill eliminado
        grupoBolasDeFogo.clear(true, true); 
        // Desativa o soco
        this.socoAtivado = false; 
    }
}