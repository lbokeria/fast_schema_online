function board_creator(board_size_px,n_rows,n_cols,current_condition_color,current_condition_border_pattern,show_pas,
    img_array,img_board_coords){

    // Border image to use
    let border_image_path = 'img/border_images/' + current_condition_border_pattern + '.png'

    // Create the grid 
    grid_border = document.createElement('div')
    grid_border.id = 'grid_border'

    grid_border.style['background-image'] = "url(" + border_image_path + ")"
    grid_border.style['background-size'] = 'contain'
    grid_border.style.height = (board_size_px + 40) + 'px'
    grid_border.style.width  = (board_size_px + 40) + 'px'
      // debugger
    // Create the grid box element
    let grid_box = document.createElement('div')
    grid_box.id = 'grid-box'
    grid_box.style = 
        'height:' + board_size_px + 'px;' + 
        'width:' + board_size_px + 'px;' + 
        'grid-template-columns: repeat('+n_cols+', 1fr);' +
        'grid-template-rows: repeat('+n_rows+', 1fr);' +
        'border: 10px solid ' + current_condition_color + ';' + 
        'background-color: white;' + 
        'position: absolute;' +
        'top: 50%;' + 
        'left: 50%;' + 
        'transform: translate(-50%, -50%);'

    for (ir = 0; ir < n_rows; ir++){

      for (ic = 0; ic < n_cols; ic++){

        iCell = document.createElement('div')

        iCell.className = 'cells'
        iCell.id = 'cell_r_' + (ir+1) + '_c_' + (ic+1)

        iCell.style = 
          'background-color: '+ current_condition_color +';' +
          'opacity: 0.4;'
          // 'border-right: 3px solid ' + current_condition_color + ';' +
          // 'border-bottom: 3px solid ' + current_condition_color + ';'

        grid_box.appendChild(iCell)

      }
    }

    if (show_pas) {
      var visibility_status = 'visible'
    } else {
      var visibility_status = 'hidden'
    }
      
    for (iImg = 0; iImg < img_array.length; iImg++){

        // Which row and col?
        let i_row = img_board_coords[iImg][0]
        let i_col = img_board_coords[iImg][1]

        iEl = document.createElement('img')

        iEl.className = 'PA'
        iEl.id = 'PA_' + (iImg+1)
        iEl.src = img_array[iImg]
        iEl.style = 
        'visibility: ' + visibility_status + ';'

        let nth_child_idx = (i_row-1)*n_cols + i_col
        
        let iCell = grid_box.children[nth_child_idx-1]
        iCell.appendChild(iEl)

    }

    grid_border.appendChild(grid_box)

    return grid_border
}