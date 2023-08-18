const getUsuarios = async () => {
  const response = await fetch("http://localhost:3000/usuarios");
  let data = await response.json();
  $(".usuarios").html("");

  $.each(data, (i, c) => {
    $(".usuarios").append(`
              <tr>
                <td>${c.nombre}</td>
                <td>${c.balance}</td>
                <td>
                  <button
                    class="btn btn-warning mr-2"
                    data-toggle="modal"
                    data-target="#exampleModal"
                    onclick="setInfoModal('${c.nombre}', '${c.balance}', '${c.id}')"
                  >
                    Editar</button
                  ><button class="btn btn-danger" onclick="eliminarUsuario('${c.id}')">Eliminar</button>
                </td>
              </tr>
         `);

    $("#emisor").append(`<option value="${c.id}">${c.nombre}</option>`);
    $("#receptor").append(`<option value="${c.id}">${c.nombre}</option>`);
  });
};

const getTransferencias = async () => {
  try {
    const { data } = await axios.get("http://localhost:3000/transferencias");
    console.log("data", data); // Imprime los datos en la consola para verificar

    $(".transferencias").html("");

    data.forEach((transferencia) => {
      $(".transferencias").append(`
        <tr>
          <td>${formatDate(transferencia.fecha)}</td>
          <td>${transferencia.nombre_emisor}</td>
          <td>${transferencia.nombre_receptor}</td>
          <td>${transferencia.monto}</td>
        </tr>
      `);
    });
  } catch (error) {
    console.error(error);
    // Manejar el error aquí si es necesario
  }
};

const setInfoModal = (nombre, balance, id) => {
  $("#nombreEdit").val(nombre);
  $("#balanceEdit").val(balance);
  $("#editButton").attr("onclick", `editUsuario('${id}')`);
};

const editUsuario = async (id) => {
  const nombre = $("#nombreEdit").val();
  const balance = $("#balanceEdit").val();
  try {
    const { data } = await axios.put(`http://localhost:3000/usuario?id=${id}`, {
      id,  
      nombre,
      balance,
    });
    $("#exampleModal").modal("hide");
    location.reload();
  } catch (e) {
    alert("Algo salió mal..." + e);
  }
};

$("form:first").submit(async (e) => {
  e.preventDefault();
  let nombre = $("form:first input:first").val();
  let balance = Number($("form:first input:nth-child(2)").val());
  console.log(nombre, balance)
  try {
    const response = await fetch("http://localhost:3000/usuario", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        balance,
      })
    });
    $("form:first input:first").val("");
    $("form:first input:nth-child(2)").val("");
    location.reload();
  } catch (e) {
    alert("Algo salió mal ..." + e);
  }
});

$("form:last").submit(async (e) => {
  e.preventDefault();
  let emisor = $("form:last select:first").val();
  let receptor = $("form:last select:last").val();
  let monto = $("#monto").val();
  if (!monto || !emisor || !receptor) {
    alert("Debe seleccionar un emisor, receptor y monto a transferir");
    return false;
  }
  if(emisor === receptor){
    alert("El emisor y el receptor no pueden ser el mismo");
    return false;
  }
  try {
    const response = await fetch("http://localhost:3000/transferencia", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emisor,
        receptor,
        monto,
      }),
    });
    const data = await response.json();
    location.reload();
  } catch (e) {
    console.log(e);
    alert(
      "La transferencia no se pudo realizar debido a fondos insuficientes en tu cuenta. Por favor, asegúrate de que tengas suficientes fondos y vuelve a intentarlo." +
        e
    );
  }
});

const eliminarUsuario = async (id) => {
  const response = await fetch("http://localhost:3000/usuario?id=" + id, {
        method: "DELETE",
      });
  getUsuarios();
};

getUsuarios();
getTransferencias();

const formatDate = (date) => {
  const dateFormat = moment(date).format("L");
  const timeFormat = moment(date).format("LTS");
  return `${dateFormat} ${timeFormat}`;
};
formatDate();